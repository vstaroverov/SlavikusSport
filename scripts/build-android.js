import { cpSync, existsSync, mkdirSync } from "node:fs";
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
    "assembleDebug",
  ],
  { cwd: androidDir, env, stdio: "inherit" },
);

const sourceApk = join(androidDir, "app", "build", "outputs", "apk", "debug", "app-debug.apk");
const apkDir = join(projectRoot, "apk");
const targetApk = join(apkDir, "Slavikus-Sport-0.017.1.apk");

mkdirSync(apkDir, { recursive: true });
cpSync(sourceApk, targetApk);
console.log(`APK ready: ${targetApk}`);
