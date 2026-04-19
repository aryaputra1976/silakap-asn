import { runCompletenessBatch } from "../completeness.batch"

export async function runCompletenessJob(
  layananId: bigint
) {

  console.log("Starting completeness job")

  try {

    await runCompletenessBatch(layananId)

    console.log("Completeness job finished")

  } catch (err) {

    console.error("Completeness job failed", err)

  }

}