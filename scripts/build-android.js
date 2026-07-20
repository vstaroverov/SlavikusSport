import { cpSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const androidDir = join(projectRoot, "android");
const wrapperJar = join(androidDir, "gradle", "wrapper", "gradle-wrapper.jar");
const wrapperClasspath = join(".", "gradle", "wrapper", "gradle-wrapper.jar");
const javaHome =
  process.env.JAVA_HOME ||
  (process.platform === "win32"
    ? "C:\\Program Files\\Android\\Android Studio\\jbr"
    : "");
const javaExecutable = join(javaHome, "bin", process.platform === "win32" ? "java.exe" : "java");

if (!existsSync(javaExecutable)) {
  throw new Error("Java 21 not found. Set JAVA_HOME to the Android Studio JBR folder.");
}

const env = {
  ...process.env,
  JAVA_HOME: javaHome,
  ANDROID_HOME:
    process.env.ANDROID_HOME ||
    join(process.env.LOCALAPPDATA || "", "Android", "Sdk"),
};
env.ANDROID_SDK_ROOT = env.ANDROID_HOME;

execFileSync(
  javaExecutable,
  [
    "-Dorg.gradle.appname=gradlew",
    "-classpath",
    wrapperClasspath,
    "org.gradle.wrapper.GradleWrapperMain",
        "assembleRelease",
  ],
  { cwd: androidDir, env, stdio: "inherit" },
);

const signedReleaseApk = join(androidDir, "app", "build", "outputs", "apk", "release", "app-release.apk");
const unsignedReleaseApk = join(androidDir, "app", "build", "outputs", "apk", "release", "app-release-unsigned.apk");
const sourceApk = existsSync(signedReleaseApk) ? signedReleaseApk : unsignedReleaseApk;
const metadataPath = join(androidDir, "app", "build", "outputs", "apk", "release", "output-metadata.json");
const metadata = JSON.parse(readFileSync(metadataPath, "utf8"));
const versionName = metadata.elements?.[0]?.versionName;

if (!versionName) {
  throw new Error("Could not read Android versionName from output metadata.");
}

const apkDir = join(projectRoot, "apk");
const targetApk = join(apkDir, existsSync(signedReleaseApk)
  ? `Slavikus-Sport-${versionName}-release.apk`
  : `Slavikus-Sport-${versionName}-release-unsigned.apk`);

mkdirSync(apkDir, { recursive: true });
cpSync(sourceApk, targetApk);
console.log(`APK ready: ${targetApk}`);
