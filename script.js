/* =========================================
   SCF - SMART COINLET FIRM
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

  /* -----------------------------------------
     GET FORM VALUES
  ----------------------------------------- */

  const name =
    document.getElementById("fullName")
      .value.trim();

  const phone =
    document.getElementById("phone")
      .value.trim();

  const email =
    document.getElementById("email")
      .value.trim()
      .toLowerCase();

  const whatsapp =
    document.getElementById("whatsapp")
      .value.trim();

  const referralInput =
    document.getElementById("referralCode");

  const referralCode =
    referralInput
      ? referralInput.value.trim().toUpperCase()
      : "";

  const password =
    document.getElementById("password").value;

  const confirmPassword =
    document.getElementById("confirmPassword").value;


  /* -----------------------------------------
     BASIC VALIDATION
  ----------------------------------------- */

  if (!name || !phone || !email || !whatsapp) {

    alert(
      "Please complete all required fields."
    );

    return;
  }


  if (password !== confirmPassword) {

    alert(
      "Passwords do not match."
    );

    return;
  }


  if (password.length < 6) {

    alert(
      "Password must contain at least 6 characters."
    );

    return;
  }


  try {

    /* -----------------------------------------
       CHECK REFERRAL CODE BEFORE CREATING ACCOUNT
    ----------------------------------------- */

    if (referralCode) {

      const {
        data: referralValid,
        error: referralError
      } = await supabaseClient.rpc(
        "check_scf_referral_code",
        {
          referral_code_input: referralCode
        }
      );


      if (referralError) {

        console.error(
          "Referral check error:",
          referralError
        );

        alert(
          "We could not verify the referral code. Please try again."
        );

        return;
      }


      if (!referralValid) {

        alert(
          "The referral code you entered is invalid.\n\n" +
          "Please check the code and try again."
        );

        return;
      }
    }


    /* -----------------------------------------
       CREATE SUPABASE AUTH ACCOUNT
    ----------------------------------------- */

    const {
      data: authData,
      error: authError
    } =
      await supabaseClient.auth.signUp({

        email: email,

        password: password

      });


    if (authError) {

      console.error(
        "Auth error:",
        authError
      );

      alert(
        "Registration failed:\n\n" +
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


    /* -----------------------------------------
       CREATE SCF PROFILE
    ----------------------------------------- */

    const {
      data: profile,
      error: profileError
    } =
      await supabaseClient
        .from("users")
        .insert([{

          id: userId,

          full_name: name,

          phone: phone,

          gmail: email,

          whatsapp_number: whatsapp,

          country: "Kenya",

          referred_by:
            referralCode || null,

          role: "user",

          approved: false,

          activated: false,

          account_status: "pending",

          level: 1,

          bonus: 270,

          balance: 0,

          loan_limit: 0,

          referral_count: 0,

          invites: 0,

          total_withdrawn: 0,

          total_earned: 0,

          tasks_completed: 0

        }])
        .select()
        .single();


    if (profileError) {

      console.error(
        "Profile error:",
        profileError
      );

      alert(
        "Your account was created, but your SCF profile could not be saved.\n\n" +
        profileError.message
      );

      return;
    }


    /* -----------------------------------------
       APPLY REFERRAL
    ----------------------------------------- */

    if (referralCode) {

      const {
        error: referralApplyError
      } =
        await supabaseClient.rpc(
          "apply_scf_referral",
          {
            referral_code_input: referralCode,
            new_user_id: userId
          }
        );


      if (referralApplyError) {

        console.error(
          "Referral application error:",
          referralApplyError
        );

        /*
          Do not cancel the account because the
          main profile was successfully created.
        */

      }
    }


    /* -----------------------------------------
       LOCAL USER DATA
    ----------------------------------------- */

    const user = {

      id: profile.id,

      name: profile.full_name,

      phone: profile.phone,

      email: profile.gmail,

      whatsapp: profile.whatsapp_number,

      country: profile.country,

      referralCode:
        profile.referral_code || "",

      referredBy:
        profile.referred_by || "",

      referralCount:
        Number(profile.referral_count) || 0,

      invites:
        Number(profile.invites) || 0,

      level:
        Number(profile.level) || 1,

      bonus:
        Number(profile.bonus) || 270,

      balance:
        Number(profile.balance) || 0,

      loanLimit:
        Number(profile.loan_limit) || 0,

      approved:
        Boolean(profile.approved),

      activated:
        Boolean(profile.activated),

      status:
        profile.account_status || "pending"

    };


    localStorage.setItem(
      "scfUser",
      JSON.stringify(user)
    );


    /* -----------------------------------------
       SUCCESS
    ----------------------------------------- */

    alert(
      "Your SCF account has been created successfully.\n\n" +
      "Your account is now waiting for SCF approval."
    );


    showSection("activation");


  } catch (error) {

    console.error(
      "Registration error:",
      error
    );

    alert(
      "Something went wrong during registration.\n\n" +
      error.message
    );

  }
}


/* =========================================
   LOGIN
========================================= */

async function loginUser(event) {

  event.preventDefault();

  const email =
    document.getElementById("loginEmail")
      .value.trim()
      .toLowerCase();

  const password =
    document.getElementById("loginPassword")
      .value;


  if (!email || !password) {

    alert(
      "Please enter your Gmail and password."
    );

    return;
  }


  try {

    /* -----------------------------------------
       AUTH LOGIN
    ----------------------------------------- */

    const {
      data: authData,
      error: authError
    } =
      await supabaseClient.auth.signInWithPassword({

        email: email,

        password: password

      });


    if (authError) {

      console.error(
        "Login error:",
        authError
      );

      alert(
        "Login failed:\n\n" +
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


    /* -----------------------------------------
       GET SCF PROFILE
    ----------------------------------------- */

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

      console.error(
        "Profile error:",
        profileError
      );

      alert(
        "Your SCF profile could not be found.\n\n" +
        profileError.message
      );

      return;
    }


    /* -----------------------------------------
       APPROVAL PROTECTION
    ----------------------------------------- */

    if (
      userProfile.approved !== true ||
      userProfile.account_status !== "approved"
    ) {

      alert(
        "Your account is still pending approval.\n\n" +
        "Please wait while SCF verifies your account."
      );

      showSection("activation");

      return;
    }


    /* -----------------------------------------
       BUILD USER OBJECT
    ----------------------------------------- */

    const user = {

      id: userProfile.id,

      name:
        userProfile.full_name,

      phone:
        userProfile.phone,

      email:
        userProfile.gmail,

      whatsapp:
        userProfile.whatsapp_number,

      country:
        userProfile.country,

      referralCode:
        userProfile.referral_code || "",

      referredBy:
        userProfile.referred_by || "",

      referralCount:
        Number(userProfile.referral_count) || 0,

      invites:
        Number(userProfile.invites) || 0,

      level:
        Number(userProfile.level) || 1,

      bonus:
        Number(userProfile.bonus) || 270,

      balance:
        Number(userProfile.balance) || 0,

      loanLimit:
        Number(userProfile.loan_limit) || 0,

      approved:
        Boolean(userProfile.approved),

      activated:
        Boolean(userProfile.activated),

      status:
        userProfile.account_status || "approved"

    };


    localStorage.setItem(
      "scfUser",
      JSON.stringify(user)
    );


    showDashboard(user);


  } catch (error) {

    console.error(
      "Login exception:",
      error
    );

    alert(
      "Something went wrong while logging in."
    );

  }
}


/* =========================================
   DASHBOARD
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


        <!-- REFERRAL AREA -->

        <div
          class="feature-card"
          style="margin-top:20px;"
        >

          <div class="feature-icon">
            🔗
          </div>

          <h3>
            Your SCF Referral Code
          </h3>

          <p>
            Share your code with friends and invite
            new members to SCF.
          </p>

          <div
            style="
              padding:12px;
              margin:12px 0;
              border-radius:8px;
              background:rgba(0,0,0,0.15);
              font-weight:bold;
              letter-spacing:1px;
            "
          >
            ${user.referralCode || "Generating..."}
          </div>

          <button
            class="primary-button"
            onclick="copyReferralCode()"
          >
            Copy Referral Code
          </button>

          <button
            class="secondary-button"
            style="margin-top:8px;"
            onclick="copyReferralLink()"
          >
            Copy Referral Link
          </button>

          <p style="margin-top:10px;">
            Invites:
            <strong>
              ${Number(user.invites || 0)}
            </strong>
          </p>

        </div>


        <!-- FEATURES -->

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
   COPY REFERRAL CODE
========================================= */

async function copyReferralCode() {

  const savedUser =
    localStorage.getItem("scfUser");

  if (!savedUser) {

    alert("Please login first.");

    return;
  }


  const user =
    JSON.parse(savedUser);


  if (!user.referralCode) {

    alert(
      "Your referral code is not available yet."
    );

    return;
  }


  try {

    await navigator.clipboard.writeText(
      user.referralCode
    );

    alert(
      "Referral code copied:\n\n" +
      user.referralCode
    );

  } catch (error) {

    alert(
      "Your referral code is:\n\n" +
      user.referralCode
    );

  }

}


/* =========================================
   COPY REFERRAL LINK
========================================= */

async function copyReferralLink() {

  const savedUser =
    localStorage.getItem("scfUser");

  if (!savedUser) {

    alert("Please login first.");

    return;
  }


  const user =
    JSON.parse(savedUser);


  if (!user.referralCode) {

    alert(
      "Your referral code is not available yet."
    );

    return;
  }


  const referralLink =
    window.location.origin +
    window.location.pathname +
    "?ref=" +
    encodeURIComponent(
      user.referralCode
    );


  try {

    await navigator.clipboard.writeText(
      referralLink
    );

    alert(
      "Referral link copied:\n\n" +
      referralLink
    );

  } catch (error) {

    alert(
      "Your referral link is:\n\n" +
      referralLink
    );

  }

}


/* =========================================
   AUTOMATIC REFERRAL FROM URL
========================================= */

function loadReferralFromURL() {

  const params =
    new URLSearchParams(
      window.location.search
    );

  const referral =
    params.get("ref");


  if (!referral) {
    return;
  }


  const referralInput =
    document.getElementById(
      "referralCode"
    );


  if (referralInput) {

    referralInput.value =
      referral.toUpperCase();

  }

}


/* =========================================
   WRITING ACCOUNT
========================================= */

function openWritingAccount() {

  const savedUser =
    localStorage.getItem("scfUser");


  if (!savedUser) {

    alert(
      "Please login first."
    );

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


  localStorage.removeItem(
    "scfUser"
  );


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


    /*
      If someone opens a referral link like:

      ?ref=SCF-XXXXXXXX

      the code is automatically placed
      inside the signup form.
    */

    loadReferralFromURL();

  }
);
