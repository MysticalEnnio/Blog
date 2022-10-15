const { createClient } = supabase;

// Create a single supabase client for interacting with your database
const db = createClient(
  "https://cewczdfxnboumewhikew.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNld2N6ZGZ4bmJvdW1ld2hpa2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjM1Mzc3NTAsImV4cCI6MTk3OTExMzc1MH0.Ez1Y-aidxb22Xrnt7mUTM_Soexa-tdBqFgOR_oax-Hk"
);

function getUserData() {
  return db.auth.getUser();
}

async function submitCode(email, token) {
  const { data, error } = await db.auth.verifyOtp({
    email,
    token,
    type: "signup",
  });
  if (error) {
    swal("Error!", error.message, "error");
  } else if (data) {
    window.location.replace("/");
  }
}
