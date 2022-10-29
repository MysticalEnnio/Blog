const { createClient } = supabase;

// Create a single supabase client for interacting with your database
const db = createClient(
  "https://cewczdfxnboumewhikew.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNld2N6ZGZ4bmJvdW1ld2hpa2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjM1Mzc3NTAsImV4cCI6MTk3OTExMzc1MH0.Ez1Y-aidxb22Xrnt7mUTM_Soexa-tdBqFgOR_oax-Hk"
);

async function signIn(email, password) {
  const userData = await db.auth.signInWithPassword({
    email,
    password,
    options: {
      redirectTo: window.location.origin,
      shouldCreateUser: false,
    },
  });
  if (userData.data.user) {
    window.location.replace("/");
  }
  if (userData.error) {
    if (userData.error.message == "Email not confirmed") {
      window.location.replace("/confirmEmail?email=" + email);
    } else {
      swal("Error!", userData.error.message, "error");
    }
  }
}

async function signInWithGoogle() {
  const userData = await db.auth.signInWithOAuth({
    // provider can be 'github', 'google', 'gitlab', and more
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/verify",
    },
  });
  if (userData.error) {
    swal("Error!", userData.error.message, "error");
  }
}
