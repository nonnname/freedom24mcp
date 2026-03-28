export function readonlyGuard(readonly: boolean) {
  if (!readonly) return null;
  return {
    isError: true,
    content: [
      {
        type: "text" as const,
        text: "Server is running in read-only mode. Write operations are disabled. Remove TRADERNET_READONLY=true to enable.",
      },
    ],
  };
}
