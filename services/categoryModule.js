import { ConstantsUrl } from "./service";

export async function isCategoryModuleVisible() {
  const response = await fetch(`${ConstantsUrl}categoryModuleVisibility`, {
    cache: "no-store",
    signal: AbortSignal.timeout(5000),
  });
  if (!response.ok) throw new Error("Unable to load category visibility.");

  const result = await response.json();
  const visible = result?.data?.isVisibleOnWeb;
  if (!result?.status || typeof visible !== "boolean") {
    throw new Error("Invalid category visibility.");
  }
  return visible;
}
