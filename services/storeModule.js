import { APP_PLATFORM, ConstantsUrl } from "@/services/service";

export async function isStoreModuleVisible(signal = AbortSignal.timeout(5000)) {
  const response = await fetch(`${ConstantsUrl}storeModuleVisibility?platform=${APP_PLATFORM}`, {
    cache: "no-store",
    signal,
  });
  if (!response.ok) throw new Error("Unable to load store module visibility.");

  const result = await response.json();
  if (!result.status || typeof result.data?.isVisible !== "boolean") {
    throw new Error("Invalid store module visibility.");
  }
  return result.data.isVisible;
}

export async function getStoreModulePageProps({ res }) {
  res.setHeader("Cache-Control", "no-store");
  return (await isStoreModuleVisible()) ? { props: {} } : { notFound: true };
}
