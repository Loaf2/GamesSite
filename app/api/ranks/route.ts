import { getBestRankScores, upsertBestRankScores } from "@/lib/db";
import { verifyGameSessionToken } from "@/lib/game-token";

const MAX_SCORE = 2_147_483_647;

function getUserId(request: Request) {
  const header = request.headers.get("authorization") ?? "";
  if (!header.startsWith("Bearer ")) return null;
  return verifyGameSessionToken(header.slice("Bearer ".length).trim());
}

function parseScore(value: unknown) {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= MAX_SCORE
	? value
	: null;
}

export async function GET(request: Request) {
  const userId = getUserId(request);
  if (!userId) {
	return Response.json({ error: "Sign in to load scores." }, { status: 401 });
  }

  try {
	const scores = await getBestRankScores(userId);
	return Response.json(scores, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
	console.error("Could not load rank scores", error);
	return Response.json({ error: "Scores could not be loaded." }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const userId = getUserId(request);
  if (!userId) {
	return Response.json({ error: "Sign in to save scores." }, { status: 401 });
  }

  try {
	const body = (await request.json()) as Record<string, unknown>;
	const aimBestScore = parseScore(body.aimBestScore);
	const twoBallsBestScore = parseScore(body.twoBallsBestScore);
	const sixBallsBestScore = parseScore(body.sixBallsBestScore);

	if (aimBestScore === null || twoBallsBestScore === null || sixBallsBestScore === null) {
	  return Response.json({ error: "Scores must be non-negative integers." }, { status: 400 });
	}

	const scores = await upsertBestRankScores({
	  userId,
	  aimBestScore,
	  twoBallsBestScore,
	  sixBallsBestScore,
	});
	return Response.json(scores, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
	console.error("Could not save rank scores", error);
	return Response.json({ error: "Scores could not be saved." }, { status: 500 });
  }
}
