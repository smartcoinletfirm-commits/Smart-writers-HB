/* =========================================
   SCF - SMART COINLET FIRM
   MAIN JAVASCRIPT
========================================= */


/* =========================================
   PAGE NAVIGATION
========================================= */

function showSection(sectionId) {

  const sections = document.querySelectorAll(".page-section");

  sections.forEach(function(section) {
    section.classList.remove("active");
  });

  const selectedSection = document.getElementById(sectionId);

  if (selectedSection) {
    selectedSection.classList.add("active");
  }

  const menu = document.getElementById("mainMenu");

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

  const menu = document.getElementById("mainMenu");

  if (menu) {
    menu.classList.toggle("show");
  }
}


/* =========================================
   ACCOUNT REGISTRATION
========================================= */

function registerUser(event) {

  event.preventDefault();

  const name = document.getElementById("fullName").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  const whatsapp = document.getElementById("whatsapp").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword =
    document.getElementById("confirmPassword").value;


  /* Check password */

  if (password !== confirmPassword) {

    alert("Passwords do not match.");

    return;
  }


  /* Basic password requirement */

  if (password.length < 6) {

    alert("Password must contain at least 6 characters.");

    return;
  }


  /* Create temporary user record */

  const user = {

    name: name,

    phone: phone,

    email: email,

    whatsapp: whatsapp,

    level: 1,

    balance: 0,

    status: "pending",

    writingAccount: false,

    createdAt: new Date().toISOString()

  };


  /*
     IMPORTANT:

     This currently stores the account locally
     in the browser.

     Later, SCF will be connected to a real
     authentication/database system.
  */

  localStorage.setItem(
    "scfUser",
    JSON.stringify(user)
  );


  /* Show activation page */

  showSection("activation");

}


/* =========================================
   LOGIN
========================================= */

function loginUser(event) {

  event.preventDefault();

  const email =
    document.getElementById("loginEmail").value.trim();

  const password =
    document.getElementById("loginPassword").value;


  const savedUser =
    localStorage.getItem("scfUser");


  if (!savedUser) {

    alert(
      "No SCF account was found on this device. Please create an account first."
    );

    showSection("signup");

    return;
  }


  const user = JSON.parse(savedUser);


  if (email !== user.email) {

    alert("Incorrect Gmail.");

    return;
  }


  /*
     This is only a temporary front-end login.

     Real password authentication will be added
     when SCF is connected to a proper backend.
  */

  if (!password) {

    alert("Please enter your password.");

    return;
  }


  alert(
    "Welcome back to SCF, " +
    user.name +
    "!"
  );


  showDashboard(user);
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

    dashboard.id = "dashboard";

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
          Welcome, <strong>${user.name}</strong>.
        </p>

        <p>
          Your current SCF level:
          <strong>Level ${user.level}</strong>
        </p>

        <p>
          Wallet balance:
          <strong>KES ${user.balance.toFixed(2)}</strong>
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


    document
      .querySelector("main")
      .appendChild(dashboard);

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


  const user = JSON.parse(savedUser);


  if (user.level < 4) {

    alert(
      "Academic Writing Account unlocks at Level 4."
    );

    return;
  }


  alert(
    "Welcome to your SCF Academic Writing Account."
  );


  /*
     The full academic writing marketplace,
     task submission system, task approval,
     earnings and writing history will be
     added in the next development stages.
  */

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
