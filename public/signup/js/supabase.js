const { createClient } = supabase;

// Create a single supabase client for interacting with your database
const db = createClient(
  "https://cewczdfxnboumewhikew.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNld2N6ZGZ4bmJvdW1ld2hpa2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjM1Mzc3NTAsImV4cCI6MTk3OTExMzc1MH0.Ez1Y-aidxb22Xrnt7mUTM_Soexa-tdBqFgOR_oax-Hk"
);

async function signUp(email, password, name) {
  const userData = await db.auth.signUp(
    {
      email,
      password,
    },
    {
      data: {
        name,
      },
      shouldCreateUser: false,
      redirectTo: window.location.origin,
    }
  );
  console.log(userData);
  if (userData.user) {
    //window.location.replace("/verify/?email=" + userData.user.email);
  }
  if (userData.error) {
    swal("Error!", userData.error.message, "error");
  }
}

async function signUpWithGoogle() {
  const userData = await db.auth.signInWithOAuth(
    {
      // provider can be 'github', 'google', 'gitlab', and more
      provider: "google",
    },
    {
      redirectTo: window.location.origin + "/createName",
      shouldCreateUser: false,
    }
  );
  if (userData.error) {
    swal("Error!", userData.error.message, "error");
  }
}
