
export async function GET() {
  return Response.json({
    environment: process.env.ENVIRONMENT
  });
}