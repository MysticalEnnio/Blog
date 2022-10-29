const { createClient } = supabase;

// Create a single supabase client for interacting with your database
const db = createClient(
  "https://cewczdfxnboumewhikew.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNld2N6ZGZ4bmJvdW1ld2hpa2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2NjM1Mzc3NTAsImV4cCI6MTk3OTExMzc1MH0.Ez1Y-aidxb22Xrnt7mUTM_Soexa-tdBqFgOR_oax-Hk"
);

async function signUp(email, password, name) {
  const userData = await db.auth.signUp({
    email,
    password,
    options: {
      data: {
        name,
        realName: true,
      },
      shouldCreateUser: false,
    },
  });
  console.log(userData);
  if (userData.data.user) {
    //set id cookie
    document.cookie = `id=${userData.data.user.id}; path=/`;
    const userData2 = await db.auth.signInWithPassword({
      email,
      password,
      options: {
        redirectTo: window.location.origin + "/verify",
        shouldCreateUser: false,
      },
    });
    if (userData2.error) {
      console.log("UserData2 error", userData2);
      window.location.replace(
        "/confirmEmail?email=" + userData.data.user.email
      );
    } else {
      window.location.replace("/verify");
    }
  }
  if (userData.error) {
    swal("Error!", userData.error.message, "error");
  }
}

async function signUpWithGoogle() {
  const userData = await db.auth.signInWithOAuth({
    // provider can be 'github', 'google', 'gitlab', and more
    provider: "google",
    options: {
      redirectTo: window.location.origin + "/createName",
      shouldCreateUser: false,
    },
  });
  if (userData.error) {
    swal("Error!", userData.error.message, "error");
  }
}
