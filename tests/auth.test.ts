import { registerAction, loginAction, type AuthState } from "../src/lib/actions/auth";
import { prisma } from "../src/lib/prisma";

// Note: Testing Server Actions in a plain script
// Next.js 'redirect()' throws a specific error starting with 'NEXT_REDIRECT'

async function runTests() {
  console.log("🚀 Starting Auth Tests...");
  
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = "StrongPassword123";

  // Clean up any old test users just in case
  await prisma.user.deleteMany({
    where: { email: { contains: "testuser_" } }
  });

  console.log("\n[1] Testing Registration...");
  const formDataReg = new FormData();
  formDataReg.append("name", "Test User");
  formDataReg.append("email", testEmail);
  formDataReg.append("password", testPassword);

  let registerSuccess = false;
  try {
    const res = await registerAction(null, formDataReg);
    if (res?.errors || res?.message) {
      console.error("❌ Registration failed:", res);
    } else {
      console.log("❌ Registration didn't redirect (Unexpected)");
    }
  } catch (e: any) {
    if (e.message && e.message.includes("NEXT_REDIRECT")) {
      console.log("✅ Registration succeeded and redirected to dashboard");
      registerSuccess = true;
    } else {
      console.error("❌ Registration threw error:", e);
    }
  }

  console.log("\n[2] Testing Duplicate Registration...");
  const formDataRegDup = new FormData();
  formDataRegDup.append("name", "Test User 2");
  formDataRegDup.append("email", testEmail); // Same email
  formDataRegDup.append("password", testPassword);

  try {
    const resDup = await registerAction(null, formDataRegDup);
    if (resDup?.message === "An account with this email already exists.") {
      console.log("✅ Duplicate registration correctly prevented.");
    } else {
      console.error("❌ Duplicate registration didn't return expected error:", resDup);
    }
  } catch (e) {
    console.error("❌ Duplicate registration threw unexpected error:", e);
  }

  console.log("\n[3] Testing Login with Correct Credentials...");
  const formDataLogin = new FormData();
  formDataLogin.append("email", testEmail);
  formDataLogin.append("password", testPassword);

  try {
    const resLogin = await loginAction(null, formDataLogin);
    if (resLogin?.errors || resLogin?.message) {
      console.error("❌ Login failed:", resLogin);
    } else {
      console.log("❌ Login didn't redirect (Unexpected)");
    }
  } catch (e: any) {
    if (e.message && e.message.includes("NEXT_REDIRECT")) {
      console.log("✅ Login succeeded and redirected to dashboard");
    } else {
      console.error("❌ Login threw error:", e);
    }
  }

  console.log("\n[4] Testing Login with Incorrect Password...");
  const formDataLoginBad = new FormData();
  formDataLoginBad.append("email", testEmail);
  formDataLoginBad.append("password", "WrongPassword123");

  try {
    const resLoginBad = await loginAction(null, formDataLoginBad);
    if (resLoginBad?.message === "Invalid email or password.") {
      console.log("✅ Login with incorrect password correctly prevented.");
    } else {
      console.error("❌ Login didn't return expected error:", resLoginBad);
    }
  } catch (e) {
    console.error("❌ Login threw unexpected error:", e);
  }

  // Cleanup
  console.log("\n🧹 Cleaning up test user...");
  const u = await prisma.user.findUnique({ where: { email: testEmail } });
  if (u) {
    // Also delete the employee profile created
    await prisma.employee.deleteMany({ where: { userId: u.id } });
    await prisma.loginActivity.deleteMany({ where: { userId: u.id } });
    await prisma.user.delete({ where: { id: u.id } });
  }

  console.log("✨ All tests completed.");
  process.exit(0);
}

runTests().catch(e => {
  console.error("Test runner failed:", e);
  process.exit(1);
});
