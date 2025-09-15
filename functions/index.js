const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

const db = admin.firestore();

exports.handleChoreCompletion = functions.firestore
  .document("chores/{choreId}")
  .onUpdate(async (change, context) => {
    const beforeData = change.before.data();
    const afterData = change.after.data();

    // Check if the chore status was just changed to 'completed'
    if (beforeData.status !== "completed" && afterData.status === "completed") {
      const choreId = context.params.choreId;
      const posterId = afterData.poster;
      const claimerId = afterData.claimer;
      const credits = afterData.credits;

      if (!posterId || !claimerId || credits == null) {
        functions.logger.error(`Chore ${choreId} is missing critical data.`, {
          posterId,
          claimerId,
          credits,
        });
        return null;
      }

      // Get references to the user documents
      const posterRef = db.collection("users").doc(posterId);
      const claimerRef = db.collection("users").doc(claimerId);

      try {
        // Run a transaction to ensure atomic update
        await db.runTransaction(async (transaction) => {
          const posterDoc = await transaction.get(posterRef);
          const claimerDoc = await transaction.get(claimerRef);

          if (!posterDoc.exists || !claimerDoc.exists) {
            throw new Error("One or both user documents do not exist.");
          }

          const posterCredits = posterDoc.data().credits;
          const claimerCredits = claimerDoc.data().credits;

          // Check if poster has enough credits
          if (posterCredits < credits) {
            // This is a potential issue. For now, we'll log it.
            // In a real-world scenario, we might reverse the chore status
            // or put the user into a negative balance.
            functions.logger.warn(`Poster ${posterId} has insufficient credits for chore ${choreId}.`);
            // We will proceed with the transfer anyway and allow negative balance for now.
          }

          // Update credits
          transaction.update(posterRef, { credits: posterCredits - credits });
          transaction.update(claimerRef, { credits: claimerCredits + credits });
        });

        functions.logger.log(
          `Successfully transferred ${credits} credits from ${posterId} to ${claimerId} for chore ${choreId}.`
        );
      } catch (error) {
        functions.logger.error(
          `Error in credit transfer for chore ${choreId}:`,
          error
        );
      }
    }
    return null;
  });
