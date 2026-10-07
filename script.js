/* =========================================
   SCF - SMART COINLET FIRM
   MAIN JAVASCRIPT
   SUPABASE CONNECTED VERSION
========================================= */


/* =========================================
   SUPABASE CONNECTION
========================================= */

const SUPABASE_URL =
  "https://dqyuawfuynunjzgchmru.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
  "sb_publishable_nyM-BBoj8d5toFpNQbGBIg_Oc0nGRTb";


const supabaseClient =
  window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_PUBLISHABLE_KEY
  );


/* =========================================
   PAGE NAVIGATION
========================================= */

function showSection(sectionId) {

  const sections =
    document.querySelectorAll(".page-section");

  sections.forEach(function(section) {
    section.classList.remove("active");
  });

  const selectedSection =
    document.getElementById(sectionId);

  if (selectedSection) {
    selectedSection.classList.add("active");
  }

  const menu =
    document.getElementById("mainMenu");

  if (menu) {
    menu.classList.remove("show");
  }

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


/* =========================================
   MOBILE MENU
========================================= */

function toggleMenu() {

  const menu =
    document.getElementById("mainMenu");

  if (menu) {
    menu.classList.toggle("show");
  }
}


/* =========================================
   ACCOUNT REGISTRATION
========================================= */

async function registerUser(event) {

  event.preventDefault();

  const name =
    document.getElementById("fullName").value.trim();

  const phone =
    document.getElementById("phone").value.trim();

  const email =
    document.getElementById("email").value.trim();

  const whatsapp =
    document.getElementById("whatsapp").value.trim();

  const password =
    document.getElementById("password").value;

  const confirmPassword =
    document.getElementById("confirmPassword").value;


  if (!name || !phone || !email || !whatsapp) {

    alert(
      "Please complete all required fields."
    );

    return;
  }


  if (password !== confirmPassword) {

    alert("Passwords do not match.");

    return;
  }


  if (password.length < 6) {

    alert(
      "Password must contain at least 6 characters."
    );

    return;
  }


  try {

    const {
      data: authData,
      error: authError
    } =
      await supabaseClient.auth.signUp({
        email: email,
        password: password
      });


    if (authError) {

      console.error(authError);

      alert(
        "Registration failed: " +
        authError.message
      );

      return;
    }


    if (!authData.user) {

      alert(
        "The account could not be created. Please try again."
      );

      return;
    }


    const userId =
      authData.user.id;


    const {
      error: profileError
    } =
      await supabaseClient
        .from("users")
        .insert([{

          id: userId,
          full_name: name,
          phone: phone,
          gmail: email,
          whatsapp: whatsapp,
          country: "Kenya",
          level: 1,
          status: "pending"

        }]);


    if (profileError) {

      console.error(profileError);

      alert(
        "Your account was created, but your SCF profile could not be saved.\n\n" +
        profileError.message
      );

      return;
    }


    const user = {

      id: userId,
      name: name,
      phone: phone,
      email: email,
      whatsapp: whatsapp,
      country: "Kenya",
      level: 1,
      balance: 0,
      status: "pending"

    };


    localStorage.setItem(
      "scfUser",
      JSON.stringify(user)
    );


    alert(
      "Your SCF account has been created successfully.\n\n" +
      "Please wait while we verify and approve your account."
    );


    showSection("activation");


  } catch (error) {

    console.error(error);

    alert(
      "Something went wrong during registration."
    );

  }
}


/* =========================================
   LOGIN
========================================= */

async function loginUser(event) {

  event.preventDefault();

  const email =
    document.getElementById("loginEmail").value.trim();

  const password =
    document.getElementById("loginPassword").value;


  if (!email || !password) {

    alert(
      "Please enter your Gmail and password."
    );

    return;
  }


  try {

    const {
      data: authData,
      error: authError
    } =
      await supabaseClient.auth.signInWithPassword({

        email: email,
        password: password

      });


    if (authError) {

      console.error(authError);

      alert(
        "Login failed: " +
        authError.message
      );

      return;
    }


    if (!authData.user) {

      alert(
        "Login could not be completed."
      );

      return;
    }


    const userId =
      authData.user.id;


    const {
      data: userProfile,
      error: profileError
    } =
      await supabaseClient
        .from("users")
        .select("*")
        .eq("id", userId)
        .single();


    if (profileError) {

      console.error(profileError);

      alert(
        "Your SCF profile could not be found."
      );

      return;
    }


    if (userProfile.status !== "approved") {

      alert(
        "Your account is still pending approval.\n\n" +
        "Please wait while SCF verifies your account."
      );

      showSection("activation");

      return;
    }


    const user = {

      id: userProfile.id,
      name: userProfile.full_name,
      phone: userProfile.phone,
      email: userProfile.gmail,
      whatsapp: userProfile.whatsapp,
      country: userProfile.country,
      level: Number(userProfile.level) || 1,
      balance: 0,
      status: userProfile.status

    };


    localStorage.setItem(
      "scfUser",
      JSON.stringify(user)
    );


    showDashboard(user);


  } catch (error) {

    console.error(error);

    alert(
      "Something went wrong while logging in."
    );

  }
}


/* =========================================
   BASIC DASHBOARD
========================================= */

function showDashboard(user) {

  let dashboard =
    document.getElementById("dashboard");


  if (!dashboard) {

    dashboard =
      document.createElement("section");

    dashboard.id =
      "dashboard";

    dashboard.className =
      "page-section active";


    dashboard.innerHTML = `

      <div class="content-card">

        <div class="country-badge">
          🇰🇪 Kenya
        </div>

        <h2>
          SCF Dashboard
        </h2>

        <p>
          Welcome,
          <strong>${user.name}</strong>.
        </p>

        <p>
          Your current SCF level:
          <strong>Level ${user.level}</strong>
        </p>

        <p>
          Wallet balance:
          <strong>
            KES ${Number(user.balance || 0).toFixed(2)}
          </strong>
        </p>


        <div class="features">

          <div class="feature-card">
            <div class="feature-icon">💰</div>
            <h3>Wallet</h3>
            <p>View your SCF balance.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">📋</div>
            <h3>Tasks</h3>
            <p>View available tasks.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">👥</div>
            <h3>Referrals</h3>
            <p>Manage your referrals.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🎮</div>
            <h3>Games</h3>
            <p>Access available games.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">💳</div>
            <h3>Withdrawal</h3>
            <p>Manage withdrawals.</p>
          </div>

          <div class="feature-card">
            <div class="feature-icon">🏦</div>
            <h3>Loan</h3>
            <p>View loan options.</p>
          </div>

        </div>


        ${
          user.level >= 4

          ? `

            <div
              class="feature-card"
              style="margin-top:20px;"
            >

              <div class="feature-icon">
                ✍️
              </div>

              <h3>
                Academic Writing Account
              </h3>

              <p>
                Your Level 4 status gives you
                access to academic writing tasks.
              </p>

              <button
                class="primary-button"
                onclick="openWritingAccount()"
              >
                Open Writing Account
              </button>

            </div>

          `

          : `

            <div
              class="feature-card"
              style="margin-top:20px;"
            >

              <div class="feature-icon">
                🔒
              </div>

              <h3>
                Academic Writing
              </h3>

              <p>
                Academic writing tasks unlock
                when you reach Level 4.
              </p>

            </div>

          `
        }

      </div>

    `;


    const main =
      document.querySelector("main");


    if (main) {
      main.appendChild(dashboard);
    }

  }


  document
    .querySelectorAll(".page-section")
    .forEach(function(section) {

      section.classList.remove("active");

    });


  dashboard.classList.add("active");


  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

}


/* =========================================
   WRITING ACCOUNT
========================================= */

function openWritingAccount() {

  const savedUser =
    localStorage.getItem("scfUser");


  if (!savedUser) {

    alert("Please login first.");

    showSection("login");

    return;
  }


  const user =
    JSON.parse(savedUser);


  if (Number(user.level) < 4) {

    alert(
      "Academic Writing Account unlocks at Level 4."
    );

    return;
  }


  alert(
    "Welcome to your SCF Academic Writing Account."
  );

}


/* =========================================
   LOGOUT
========================================= */

async function logoutUser() {

  try {

    await supabaseClient.auth.signOut();

  } catch (error) {

    console.error(error);

  }


  localStorage.removeItem("scfUser");

  showSection("login");

  alert(
    "You have been logged out."
  );

}


/* =========================================
   STARTUP
========================================= */

document.addEventListener(
  "DOMContentLoaded",
  function() {

    console.log(
      "SCF - Smart Coinlet Firm loaded successfully."
    );

  }
);
