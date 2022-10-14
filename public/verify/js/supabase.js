const { createClient } = supabase;

// Create a single supabase client for interacting with your database
const db = createClient(
  "https://cewczdfxnboumewhikew.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNld2N6ZGZ4bmJvdW1ld2hpa2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjM1Mzc3NTAsImV4cCI6MTk3OTExMzc1MH0.Ez1Y-aidxb22Xrnt7mUTM_Soexa-tdBqFgOR_oax-Hk"
);

async function verifyEmail() {
  let token = document.getElementById("codeInput").value;
  console.log(params.email, token);
  const result = await db.auth.signInWithOtp({
    email: params.email,
    token,
    type: "magiclink",
  });
  console.log(result);
}
