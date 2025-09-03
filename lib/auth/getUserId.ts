export async function getUserId(req: Request): Promise<string> {
  const id = (req.headers as any).get?.('x-user-id') ?? (req as any).headers?.get?.('x-user-id');
  if (!id) throw new Error('Unauthorized: missing x-user-id header');
  return id;
}
