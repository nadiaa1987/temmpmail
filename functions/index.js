const { onRequest, onSchedule } = require("firebase-functions/v2/https");
const { logger } = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

// 1. Incoming Email Webhook
// Use this with a service like Cloudflare Email Workers or Mailgun
exports.incomingEmail = onRequest({ cors: true }, async (req, res) => {
    if (req.method !== "POST") {
        return res.status(405).send("Method Not Allowed");
    }

    const { from, to, subject, text, html, attachments } = req.body;
    // 'to' would be something like user-unique-id@yourdomain.com
    const recipientEmail = to.toLowerCase();

    try {
        // Find the record of this temp email in Firestore
        const emailRef = db.collection("temp_addresses").where("address", "==", recipientEmail);
        const snapshot = await emailRef.get();

        if (snapshot.empty) {
            return res.status(404).send("Recipient address not found");
        }

        const addressDoc = snapshot.docs[0];
        const { userId } = addressDoc.data();

        // Store the email in the 'emails' collection
        await db.collection("emails").add({
            userId,
            recipientEmail,
            from,
            subject,
            text: text || "",
            html: html || "",
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
            read: false,
        });

        // Update analytics
        const today = new Date().toISOString().split("T")[0];
        const analyticsRef = db.collection("analytics").doc(today);
        await analyticsRef.set({
            emailsReceived: admin.firestore.FieldValue.increment(1)
        }, { merge: true });

        return res.status(200).send("Email stored");
    } catch (error) {
        logger.error("Error processing incoming email", error);
        return res.status(500).send("Internal Server Error");
    }
});

// 2. Generate Random/Custom Email Address
exports.generateEmail = onRequest({ cors: true }, async (req, res) => {
    // Verify Firebase Auth token
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(401).send("Unauthorized");

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userId = decodedToken.uid;
        const { customPrefix, domain } = req.body;

        // Check user limits
        const userDoc = await db.collection("users").doc(userId).get();
        const userData = userDoc.data() || { plan: "free" };

        const countSnapshot = await db.collection("temp_addresses").where("userId", "==", userId).get();
        if (userData.plan === "free" && countSnapshot.size >= 1) {
            return res.status(403).send("Free plan limit reached (1 address)");
        }

        const prefix = customPrefix || Math.random().toString(36).substring(2, 10);
        const finalAddress = `${prefix}@${domain}`.toLowerCase();

        // Check if address exists
        const existing = await db.collection("temp_addresses").where("address", "==", finalAddress).get();
        if (!existing.empty) {
            return res.status(409).send("Address already exists");
        }

        await db.collection("temp_addresses").add({
            userId,
            address: finalAddress,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return res.status(200).json({ address: finalAddress });
    } catch (error) {
        logger.error("Error generating email", error);
        return res.status(500).send("Internal Server Error");
    }
});

// 3. Delete Email
exports.deleteEmail = onRequest({ cors: true }, async (req, res) => {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(401).send("Unauthorized");

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const userId = decodedToken.uid;
        const { emailId } = req.body;

        const emailRef = db.collection("emails").doc(emailId);
        const emailDoc = await emailRef.get();

        if (!emailDoc.exists || emailDoc.data().userId !== userId) {
            return res.status(403).send("Forbidden");
        }

        await emailRef.delete();
        return res.status(200).send("Deleted");
    } catch (error) {
        return res.status(500).send("Internal Server Error");
    }
});

// 4. Admin: Add Domain
exports.adminAddDomain = onRequest({ cors: true }, async (req, res) => {
    const idToken = req.headers.authorization?.split("Bearer ")[1];
    if (!idToken) return res.status(401).send("Unauthorized");

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        const adminRef = db.collection("admins").doc(decodedToken.uid);
        const adminDoc = await adminRef.get();

        if (!adminDoc.exists) return res.status(403).send("Admin only");

        const { domainName } = req.body;
        await db.collection("domains").doc(domainName).set({
            name: domainName,
            active: true,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        });

        return res.status(200).send("Domain added");
    } catch (error) {
        return res.status(500).send("Internal Server Error");
    }
});

// 5. Automatic Cleanup (24h)
exports.cleanupEmails = onSchedule("every 24 hours", async (event) => {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const oldEmails = await db.collection("emails")
        .where("createdAt", "<", yesterday)
        .get();

    const batch = db.batch();
    oldEmails.forEach(doc => batch.delete(doc.ref));
    await batch.commit();

    logger.info(`Cleaned up ${oldEmails.size} expired emails.`);
});
