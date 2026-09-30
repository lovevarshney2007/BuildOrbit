import { sendOtpAction, verifyOtpAction, loginAction, type AuthState } from "../src/lib/actions/auth";
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

  console.log("\n[1] Testing Registration (OTP Send)...");
  const formDataReg = new FormData();
  formDataReg.append("name", "Test User");
  formDataReg.append("email", testEmail);
  formDataReg.append("password", testPassword);

  try {
    const res = await sendOtpAction(null, formDataReg);
    if (res?.step === "VERIFY_OTP") {
      console.log("✅ OTP successfully sent and stored.");
    } else {
      console.error("❌ OTP sending failed:", res);
    }
  } catch (e: any) {
    console.error("❌ OTP sending threw error:", e);
  }

  console.log("\n[2] Testing OTP Verification...");
  const otpRecord = await prisma.otpVerification.findUnique({ where: { email: testEmail } });
  if (!otpRecord) {
    console.error("❌ No OTP found in database for test email.");
  } else {
    const formDataVerify = new FormData();
    formDataVerify.append("name", "Test User");
    formDataVerify.append("email", testEmail);
    formDataVerify.append("password", testPassword);
    formDataVerify.append("otp", otpRecord.otp);

    try {
      const resVerify = await verifyOtpAction(null, formDataVerify);
      if (resVerify?.errors || resVerify?.message) {
         console.error("❌ OTP Verification failed:", resVerify);
      } else {
         console.log("❌ OTP Verification didn't redirect (Unexpected)");
      }
    } catch (e: any) {
      if (e.message && e.message.includes("NEXT_REDIRECT")) {
        console.log("✅ OTP Verification succeeded, user created, and redirected to dashboard");
      } else {
        console.error("❌ OTP Verification threw error:", e);
      }
    }
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
