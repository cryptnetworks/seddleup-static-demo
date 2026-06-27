(function () {
  "use strict";

  var STORAGE_KEY = "seddleup-static-demo-state-v1";
  var THEME_KEY = "seddleup-static-demo-theme";
  var categories = ["Transportation", "Food", "Lodging", "Activities", "Supplies", "Other"];
  var expenseStatuses = ["draft", "submitted", "approved", "disputed", "settled"];
  var currentUser = {
    id: "user-mia",
    name: "Mia Donovan",
    email: "mia@example.test",
    role: "member"
  };

  var app = document.getElementById("app");
  var state = loadState();

  document.addEventListener("DOMContentLoaded", function () {
    applyTheme();
    bindEvents();
    ensureDefaultRoute();
    render();
  });

  window.addEventListener("hashchange", function () {
    render();
    window.scrollTo({ top: 0, behavior: "auto" });
  });

  function bindEvents() {
    app.addEventListener("click", handleClick);
    app.addEventListener("submit", handleSubmit);
    app.addEventListener("change", handleChange);
  }

  function ensureDefaultRoute() {
    if (!window.location.hash) {
      window.location.hash = "#/dashboard";
    }
  }

  function loadState() {
    try {
      var raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        var parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.trips)) {
          return parsed;
        }
      }
    } catch (error) {
      console.warn("Demo state could not be loaded.", error);
    }
    return createDemoState();
  }

  function saveState() {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function resetState() {
    state = createDemoState();
    saveState();
    render();
  }

  function createDemoState() {
    return {
      currentUser: currentUser,
      updatedAt: new Date().toISOString(),
      trips: [
        {
          id: "trip-rocky",
          name: "Rocky Mountain Weekend",
          destination: "Denver, CO",
          startDate: "2026-06-19",
          endDate: "2026-06-23",
          role: "owner",
          participants: [
            participant("p-rocky-mia", "Mia Donovan", "mia@example.test", true, [
              paymentMethod("Venmo", "@miadonovan", "https://venmo.com/miadonovan")
            ]),
            participant("p-rocky-avery", "Avery Chen", "avery@example.test", false, [
              paymentMethod("Cash App", "$averychen", "")
            ]),
            participant("p-rocky-jordan", "Jordan Blake", "jordan@example.test", false, []),
            participant("p-rocky-priya", "Priya Shah", "priya@example.test", false, [
              paymentMethod("PayPal", "priya.shah", "")
            ])
          ],
          expenses: [
            expense({
              id: "expense-cabin",
              title: "Cabin reservation",
              amount: 1280,
              category: "Lodging",
              payerId: "p-rocky-avery",
              date: "2026-06-18",
              status: "approved",
              notes: "Deposit and balance for the long weekend rental.",
              createdBy: "Avery Chen",
              shares: ["p-rocky-mia", "p-rocky-avery", "p-rocky-jordan", "p-rocky-priya"]
            }),
            expense({
              id: "expense-rides",
              title: "Airport rides",
              amount: 164.4,
              category: "Transportation",
              payerId: "p-rocky-mia",
              date: "2026-06-19",
              status: "submitted",
              notes: "Two rides from DEN plus the return shuttle.",
              createdBy: "Mia Donovan",
              shares: ["p-rocky-mia", "p-rocky-jordan", "p-rocky-priya"]
            }),
            expense({
              id: "expense-permits",
              title: "Trail permits",
              amount: 96,
              category: "Activities",
              payerId: "p-rocky-priya",
              date: "2026-06-20",
              status: "settled",
              notes: "",
              createdBy: "Priya Shah",
              shares: ["p-rocky-mia", "p-rocky-avery", "p-rocky-jordan", "p-rocky-priya"]
            }),
            expense({
              id: "expense-dinner",
              title: "Brewery dinner",
              amount: 218.75,
              category: "Food",
              payerId: "p-rocky-jordan",
              date: "2026-06-21",
              status: "disputed",
              notes: "Avery skipped dinner, so the share list is waiting on review.",
              createdBy: "Jordan Blake",
              shares: ["p-rocky-mia", "p-rocky-jordan", "p-rocky-priya"]
            }),
            expense({
              id: "expense-snacks",
              title: "Trail snacks and gear tape",
              amount: 47.2,
              category: "Supplies",
              payerId: "p-rocky-mia",
              date: "2026-06-22",
              status: "draft",
              notes: "Draft from the convenience store receipt.",
              createdBy: "Mia Donovan",
              shares: ["p-rocky-mia", "p-rocky-avery", "p-rocky-jordan", "p-rocky-priya"]
            })
          ],
          auditLogs: [
            audit("Trip created", "2026-05-25"),
            audit("Cabin reservation approved", "2026-06-18"),
            audit("Brewery dinner marked disputed", "2026-06-21"),
            audit("Trail snacks saved as draft", "2026-06-22")
          ]
        },
        {
          id: "trip-austin",
          name: "Austin Build Sprint",
          destination: "Austin, TX",
          startDate: "2026-05-05",
          endDate: "2026-05-09",
          role: "admin",
          participants: [
            participant("p-austin-mia", "Mia Donovan", "mia@example.test", true, [
              paymentMethod("Venmo", "@miadonovan", "https://venmo.com/miadonovan")
            ]),
            participant("p-austin-eli", "Eli Brooks", "eli@example.test", false, []),
            participant("p-austin-nora", "Nora Patel", "nora@example.test", false, [
              paymentMethod("Zelle", "nora@example.test", "")
            ]),
            participant("p-austin-sam", "Sam Rivera", "sam@example.test", false, [])
          ],
          expenses: [
            expense({
              id: "expense-hotel",
              title: "Hotel block",
              amount: 1842.16,
              category: "Lodging",
              payerId: "p-austin-nora",
              date: "2026-05-05",
              status: "approved",
              notes: "Four rooms near the office.",
              createdBy: "Nora Patel",
              shares: ["p-austin-mia", "p-austin-eli", "p-austin-nora", "p-austin-sam"]
            }),
            expense({
              id: "expense-tacos",
              title: "Team tacos",
              amount: 132.8,
              category: "Food",
              payerId: "p-austin-eli",
              date: "2026-05-06",
              status: "settled",
              notes: "",
              createdBy: "Eli Brooks",
              shares: ["p-austin-mia", "p-austin-eli", "p-austin-nora", "p-austin-sam"]
            }),
            expense({
              id: "expense-workshop",
              title: "Workshop supplies",
              amount: 284.55,
              category: "Supplies",
              payerId: "p-austin-mia",
              date: "2026-05-07",
              status: "approved",
              notes: "Whiteboards, adapters, markers, and snacks.",
              createdBy: "Mia Donovan",
              shares: ["p-austin-mia", "p-austin-eli", "p-austin-nora", "p-austin-sam"]
            }),
            expense({
              id: "expense-rideshare",
              title: "Rideshare batch",
              amount: 214.9,
              category: "Transportation",
              payerId: "p-austin-sam",
              date: "2026-05-08",
              status: "approved",
              notes: "",
              createdBy: "Sam Rivera",
              shares: ["p-austin-mia", "p-austin-eli", "p-austin-nora", "p-austin-sam"]
            })
          ],
          auditLogs: [
            audit("Hotel block approved", "2026-05-05"),
            audit("Workshop supplies added", "2026-05-07"),
            audit("Team tacos settled", "2026-05-09")
          ]
        },
        {
          id: "trip-obx",
          name: "Outer Banks House",
          destination: "Nags Head, NC",
          startDate: "2026-08-02",
          endDate: "2026-08-08",
          role: "member",
          participants: [
            participant("p-obx-mia", "Mia Donovan", "mia@example.test", true, [
              paymentMethod("Venmo", "@miadonovan", "https://venmo.com/miadonovan")
            ]),
            participant("p-obx-lena", "Lena Ortiz", "lena@example.test", false, []),
            participant("p-obx-cam", "Cam Wilson", "cam@example.test", false, [
              paymentMethod("PayPal", "cam.wilson", "")
            ]),
            participant("p-obx-zoe", "Zoe Kim", "zoe@example.test", false, []),
            participant("p-obx-marcus", "Marcus King", "marcus@example.test", false, [])
          ],
          expenses: [
            expense({
              id: "expense-deposit",
              title: "Beach house deposit",
              amount: 950,
              category: "Lodging",
              payerId: "p-obx-lena",
              date: "2026-06-12",
              status: "approved",
              notes: "First half of the rental deposit.",
              createdBy: "Lena Ortiz",
              shares: ["p-obx-mia", "p-obx-lena", "p-obx-cam", "p-obx-zoe", "p-obx-marcus"]
            }),
            expense({
              id: "expense-groceries",
              title: "Arrival groceries",
              amount: 312.45,
              category: "Food",
              payerId: "p-obx-mia",
              date: "2026-08-02",
              status: "submitted",
              notes: "Shared starter shop for the house.",
              createdBy: "Mia Donovan",
              shares: ["p-obx-mia", "p-obx-lena", "p-obx-cam", "p-obx-zoe", "p-obx-marcus"]
            }),
            expense({
              id: "expense-kayaks",
              title: "Kayak reservation",
              amount: 240,
              category: "Activities",
              payerId: "p-obx-cam",
              date: "2026-07-19",
              status: "draft",
              notes: "Only four people are paddling.",
              createdBy: "Cam Wilson",
              shares: ["p-obx-mia", "p-obx-lena", "p-obx-cam", "p-obx-zoe"]
            })
          ],
          auditLogs: [
            audit("Beach house deposit approved", "2026-06-12"),
            audit("Kayak reservation saved as draft", "2026-07-19"),
            audit("Arrival groceries submitted", "2026-08-02")
          ]
        }
      ]
    };
  }

  function participant(id, name, email, linked, paymentMethods) {
    return {
      id: id,
      name: name,
      email: email,
      userId: linked ? currentUser.id : null,
      paymentMethods: paymentMethods || [],
      createdAt: new Date().toISOString()
    };
  }

  function paymentMethod(provider, handle, url) {
    return {
      provider: provider,
      handle: handle,
      url: url || ""
    };
  }

  function audit(action, date) {
    return {
      id: makeId("audit"),
      action: action,
      createdAt: date
    };
  }

  function expense(input) {
    return {
      id: input.id,
      title: input.title,
      amount: roundCurrency(input.amount),
      category: input.category,
      payerId: input.payerId,
      date: input.date,
      status: input.status,
      notes: input.notes || "",
      createdByUserId: input.createdBy === currentUser.name ? currentUser.id : null,
      createdBy: {
        username: input.createdBy,
        email: input.createdBy.toLowerCase().replace(/\s+/g, ".") + "@example.test"
      },
      shares: makeShares(input.amount, input.shares)
    };
  }

  function makeShares(amount, participantIds) {
    var shares = calculateEqualShares(Number(amount), participantIds.length);
    return participantIds.map(function (participantId, index) {
      return {
        participantId: participantId,
        shareAmount: shares[index] || 0
      };
    });
  }

  function render() {
    var route = getRoute();
    var page = renderPage(route);
    app.innerHTML = renderShell(page.html, page.active);
    document.title = page.title + " | SeddleUp Static Demo";
  }

  function renderShell(content, active) {
    return [
      '<div class="app-shell">',
      '<header class="topbar">',
      '<div class="topbar-inner">',
      '<a class="brand" href="#/dashboard" aria-label="SeddleUp dashboard">',
      '<img src="assets/logo.png" alt="SeddleUp" />',
      "</a>",
      '<nav class="desktop-nav" aria-label="Primary">',
      navLink("Dashboard", "#/dashboard", active === "dashboard"),
      navLink("Trips", "#/trips", active === "trips"),
      '<a class="btn btn-primary" href="#/trips/new">New trip</a>',
      navLink("Account", "#/account", active === "account"),
      '<button class="icon-btn" type="button" data-action="toggle-theme" aria-label="Toggle theme" title="Toggle theme">' +
        (isDarkTheme() ? "L" : "D") +
        "</button>",
      '<button class="btn btn-ghost" type="button" data-action="reset-demo">Reset</button>',
      "</nav>",
      "</div>",
      "</header>",
      '<main class="main">',
      content,
      "</main>",
      renderMobileNav(active),
      "</div>"
    ].join("");
  }

  function navLink(label, href, active) {
    return (
      '<a class="btn btn-secondary nav-link' +
      (active ? " active" : "") +
      '" href="' +
      href +
      '">' +
      escapeHtml(label) +
      "</a>"
    );
  }

  function renderMobileNav(active) {
    return [
      '<nav class="mobile-nav" aria-label="Mobile primary">',
      '<div class="mobile-nav-inner">',
      mobileNavLink("Home", "#/dashboard", active === "dashboard", "H"),
      mobileNavLink("Trips", "#/trips", active === "trips", "T"),
      mobileNavLink("New", "#/trips/new", active === "new-trip", "+"),
      mobileNavLink("Account", "#/account", active === "account", "A"),
      "</div>",
      "</nav>"
    ].join("");
  }

  function mobileNavLink(label, href, active, symbol) {
    return (
      '<a class="' +
      (active ? "active" : "") +
      '" href="' +
      href +
      '"><span class="mobile-symbol">' +
      escapeHtml(symbol) +
      '</span><span>' +
      escapeHtml(label) +
      "</span></a>"
    );
  }

  function renderPage(route) {
    var first = route.segments[0] || "dashboard";

    if (first === "dashboard") {
      return { title: "Dashboard", active: "dashboard", html: renderDashboard() };
    }

    if (first === "trips" && route.segments[1] === "new") {
      return { title: "New Trip", active: "new-trip", html: renderNewTrip() };
    }

    if (first === "trips") {
      return { title: "Trips", active: "trips", html: renderTrips(route) };
    }

    if (first === "trip" && route.segments[1]) {
      var trip = findTrip(route.segments[1]);
      if (!trip) {
        return { title: "Trip Not Found", active: "trips", html: renderNotFound() };
      }
      return {
        title: trip.name,
        active: "trips",
        html: renderTripDetail(trip, route)
      };
    }

    if (first === "account") {
      return { title: "Account", active: "account", html: renderAccount() };
    }

    return { title: "Dashboard", active: "dashboard", html: renderDashboard() };
  }

  function renderDashboard() {
    var summaries = state.trips.map(summarizeTrip);
    var totalParticipants = summaries.reduce(function (sum, item) {
      return sum + item.participantCount;
    }, 0);
    var totalExpenses = summaries.reduce(function (sum, item) {
      return roundCurrency(sum + item.totalCost);
    }, 0);
    var openReviewCount = countExpenses(function (expenseItem) {
      return expenseItem.status === "submitted" || expenseItem.status === "disputed";
    });
    var unsettledCount = countExpenses(function (expenseItem) {
      return expenseItem.status !== "draft" && expenseItem.status !== "settled";
    });
    var settlements = summaries
      .flatMap(function (summary) {
        return summary.settlements.map(function (settlement) {
          return {
            trip: summary.trip,
            settlement: settlement
          };
        });
      })
      .slice(0, 5);

    return [
      renderPageHeader({
        eyebrow: "SeddleUp",
        title: "Dashboard",
        description: "Review trips, people, shared costs, and settlement status in one place.",
        actions:
          '<a class="btn btn-primary" href="#/trips/new">Create Trip</a>' +
          '<a class="btn btn-secondary" href="#/trips">View Trips</a>'
      }),
      '<section class="stats-grid" aria-label="Dashboard summary">',
      statCard("Total trips", state.trips.length, "Active demo ledgers", "accent-ocean"),
      statCard("Participants", totalParticipants, "Across all trips", "accent-plum"),
      statCard("Expenses", formatCurrency(totalExpenses), "Included in balances", "accent-gold"),
      statCard("Needs review", openReviewCount, unsettledCount + " unsettled items", "accent-coral"),
      "</section>",
      '<div class="layout-two dashboard-layout">',
      '<section>',
      '<div class="row-between">',
      '<h2 class="section-title">Recent trips</h2>',
      '<a class="mini-btn" href="#/trips">View all</a>',
      "</div>",
      '<div class="trip-grid">',
      summaries
        .slice(0, 4)
        .map(function (summary) {
          return renderTripCard(summary.trip);
        })
        .join(""),
      "</div>",
      "</section>",
      '<aside class="grid">',
      '<section class="card panel">',
      '<div class="row-between">',
      '<h2 class="section-title">Settlement queue</h2>',
      '<span class="badge">' + settlements.length + " suggested</span>",
      "</div>",
      settlements.length
        ? '<div class="settlement-list">' +
          settlements
            .map(function (item) {
              return renderSettlementItem(item.settlement, item.trip);
            })
            .join("") +
          "</div>"
        : renderInlineEmpty("No settlement recommendations yet."),
      "</section>",
      '<section class="card panel">',
      '<h2 class="section-title">Status mix</h2>',
      renderStatusSummary(),
      "</section>",
      "</aside>",
      "</div>"
    ].join("");
  }

  function renderTrips(route) {
    var search = (route.query.get("search") || "").trim().toLowerCase();
    var trips = state.trips.filter(function (trip) {
      if (!search) return true;
      return (
        trip.name.toLowerCase().indexOf(search) !== -1 ||
        trip.destination.toLowerCase().indexOf(search) !== -1
      );
    });

    return [
      renderPageHeader({
        eyebrow: "Trips",
        title: "Your trips",
        description: "Open a trip to add participants, record shared costs, and review balances.",
        actions: '<a class="btn btn-primary" href="#/trips/new">Create Trip</a>'
      }),
      '<form class="search-row" data-form="trip-search">',
      '<label class="sr-only" for="trip-search">Search trips</label>',
      '<div class="toolbar-row">',
      '<input class="field" id="trip-search" name="search" value="' +
        escapeAttr(search) +
        '" placeholder="Search trips or destinations" />',
      '<button class="btn btn-secondary" type="submit">Search</button>',
      "</div>",
      "</form>",
      trips.length
        ? '<section class="trip-grid">' + trips.map(renderTripCard).join("") + "</section>"
        : renderEmptyState("No trips found", "Try a different search or create a new trip.", "Create trip", "#/trips/new")
    ].join("");
  }

  function renderNewTrip() {
    return [
      renderPageHeader({
        eyebrow: "Trips",
        title: "Create trip",
        description: "Start a ledger with dates, destination, and an initial participant list."
      }),
      '<section class="card panel">',
      '<form class="form" data-form="new-trip">',
      '<div class="form-grid">',
      renderField("Trip name", "name", "text", "", "Ski weekend", true),
      renderField("Destination", "destination", "text", "", "Park City, UT", true),
      renderField("Start date", "startDate", "date", "", "", true),
      renderField("End date", "endDate", "date", "", "", true),
      "</div>",
      '<div>',
      '<label class="label" for="participants">Participants</label>',
      '<textarea class="field" id="participants" name="participants" placeholder="One name per line"></textarea>',
      "</div>",
      '<div class="form-actions">',
      '<button class="btn btn-primary" type="submit">Create Trip</button>',
      '<a class="btn btn-secondary" href="#/trips">Cancel</a>',
      "</div>",
      "</form>",
      "</section>"
    ].join("");
  }

  function renderTripDetail(trip, route) {
    var filter = route.query.get("filter") || "all";
    var summary = summarizeTrip(trip);
    var filteredExpenses = filterExpenses(trip.expenses, filter);
    var mode = route.segments[2] === "expense" ? route.segments[3] : "";
    var editExpense =
      route.segments[2] === "expense" && route.segments[3] === "edit"
        ? findExpense(trip, route.segments[4])
        : null;
    var showExpenseForm = mode === "new" || Boolean(editExpense);

    return [
      renderPageHeader({
        eyebrow: "Trip summary",
        title: trip.name,
        description:
          escapeHtml(trip.destination || "Destination pending") +
          " - " +
          formatDate(trip.startDate) +
          " to " +
          formatDate(trip.endDate),
        actions:
          '<a class="btn btn-primary" href="#/trip/' +
          trip.id +
          '/expense/new">Add Expense</a>' +
          '<a class="btn btn-secondary" href="#/trips">All Trips</a>' +
          '<button class="btn btn-danger" type="button" data-action="delete-trip" data-trip-id="' +
          trip.id +
          '">Delete Trip</button>'
      }),
      '<section class="stats-grid" aria-label="Trip summary">',
      statCard("Total cost", formatCurrency(summary.totalCost), "Balance-visible expenses", "accent-ocean"),
      statCard("Participants", summary.participantCount, "Travelers in the ledger", "accent-plum"),
      statCard("Expenses", summary.balanceExpenseCount, "Included in balances", "accent-gold"),
      statCard("Settlements", summary.settlements.length, "Suggested transfers", "accent-coral"),
      "</section>",
      showExpenseForm ? renderExpenseForm(trip, editExpense) : "",
      '<div class="layout-two">',
      '<div class="grid">',
      renderParticipantsPanel(trip),
      '<section class="card panel">',
      '<div class="toolbar-row">',
      '<h2 class="section-title">Expense history</h2>',
      '<a class="mini-btn" href="#/trip/' + trip.id + '/expense/new">Add expense</a>',
      "</div>",
      renderFilterRow(trip.id, filter),
      filteredExpenses.length
        ? '<div class="expense-list">' +
          filteredExpenses
            .map(function (expenseItem) {
              return renderExpenseCard(trip, expenseItem);
            })
            .join("") +
          "</div>"
        : renderEmptyState("No expenses here", "Change filters or add a shared cost.", "Add expense", "#/trip/" + trip.id + "/expense/new"),
      "</section>",
      "</div>",
      '<aside class="grid">',
      '<section class="card panel">',
      '<h2 class="section-title">Balances</h2>',
      summary.balances.length
        ? '<div class="balance-list">' + summary.balances.map(renderBalanceCard).join("") + "</div>"
        : renderInlineEmpty("Add participants and expenses to calculate balances."),
      "</section>",
      '<section class="card panel">',
      '<h2 class="section-title">Settlement suggestions</h2>',
      summary.settlements.length
        ? '<div class="settlement-list">' +
          summary.settlements
            .map(function (settlement) {
              return renderSettlementItem(settlement, trip);
            })
            .join("") +
          "</div>"
        : renderInlineEmpty("No settlement recommendations yet."),
      "</section>",
      '<section class="card panel">',
      '<h2 class="section-title">Trip activity</h2>',
      trip.auditLogs.length
        ? '<div class="activity-list">' +
          trip.auditLogs
            .slice()
            .reverse()
            .map(renderActivity)
            .join("") +
          "</div>"
        : renderInlineEmpty("Trip changes will appear here."),
      "</section>",
      "</aside>",
      "</div>"
    ].join("");
  }

  function renderParticipantsPanel(trip) {
    return [
      '<section class="card panel">',
      '<div class="row-between">',
      '<h2 class="section-title">Participants</h2>',
      '<span class="badge">' + trip.participants.length + " total</span>",
      "</div>",
      '<form class="form" data-form="participant" data-trip-id="' + trip.id + '">',
      '<div class="form-grid">',
      renderField("Name", "name", "text", "", "Name", true),
      renderField("Email", "email", "email", "", "Email optional", false),
      "</div>",
      '<div class="form-actions">',
      '<button class="btn btn-secondary" type="submit">Add participant</button>',
      "</div>",
      "</form>",
      trip.participants.length
        ? '<div class="participant-list" style="margin-top: 14px;">' +
          trip.participants
            .map(function (participantItem) {
              return renderParticipant(trip, participantItem);
            })
            .join("") +
          "</div>"
        : renderInlineEmpty("Add travelers before recording expenses."),
      "</section>"
    ].join("");
  }

  function renderParticipant(trip, participantItem) {
    var referenced = trip.expenses.some(function (expenseItem) {
      return (
        expenseItem.payerId === participantItem.id ||
        expenseItem.shares.some(function (share) {
          return share.participantId === participantItem.id;
        })
      );
    });
    return [
      '<div class="participant-item">',
      '<div>',
      '<p class="participant-name">' + escapeHtml(participantItem.name) + "</p>",
      '<p class="participant-meta">' +
        escapeHtml(participantItem.email || "No email provided") +
        (participantItem.userId ? " - linked app user" : "") +
        "</p>",
      "</div>",
      '<div class="participant-actions">',
      referenced
        ? '<span class="badge">In use</span>'
        : '<button class="mini-btn danger" type="button" data-action="delete-participant" data-trip-id="' +
          trip.id +
          '" data-participant-id="' +
          participantItem.id +
          '">Delete</button>',
      "</div>",
      "</div>"
    ].join("");
  }

  function renderExpenseForm(trip, expenseItem) {
    var editing = Boolean(expenseItem);
    var sharedIds = new Set((expenseItem ? expenseItem.shares : []).map(function (share) {
      return share.participantId;
    }));
    var defaultShares = editing ? sharedIds : new Set(trip.participants.map(function (participantItem) {
      return participantItem.id;
    }));

    return [
      '<section class="card panel" style="margin-bottom: 18px;">',
      '<div class="row-between">',
      '<h2 class="section-title">' + (editing ? "Edit expense" : "Add expense") + "</h2>",
      '<a class="mini-btn" href="#/trip/' + trip.id + '">Close</a>',
      "</div>",
      '<form class="form" data-form="expense" data-trip-id="' +
        trip.id +
        '" data-expense-id="' +
        (editing ? expenseItem.id : "") +
        '">',
      '<div class="form-grid">',
      renderField("Title", "title", "text", editing ? expenseItem.title : "", "Dinner, lodging, tickets", true),
      renderField(
        "Amount",
        "amount",
        "number",
        editing ? Number(expenseItem.amount).toFixed(2) : "",
        "0.00",
        true,
        'step="0.01" min="0.01"'
      ),
      renderSelect("Category", "category", categories, editing ? expenseItem.category : categories[0]),
      renderSelect(
        "Payer",
        "payerId",
        trip.participants.map(function (participantItem) {
          return { value: participantItem.id, label: participantItem.name };
        }),
        editing ? expenseItem.payerId : trip.participants[0] && trip.participants[0].id
      ),
      renderField("Date", "date", "date", editing ? expenseItem.date : todayInput(), "", true),
      renderSelect("Status", "status", expenseStatuses, editing ? expenseItem.status : "submitted"),
      "</div>",
      '<fieldset>',
      '<legend class="label">Shared by</legend>',
      '<div class="check-grid">',
      trip.participants
        .map(function (participantItem) {
          return (
            '<label class="check-item">' +
            '<input name="sharedParticipantIds" type="checkbox" value="' +
            participantItem.id +
            '"' +
            (defaultShares.has(participantItem.id) ? " checked" : "") +
            " />" +
            "<span>" +
            escapeHtml(participantItem.name) +
            "</span>" +
            "</label>"
          );
        })
        .join(""),
      "</div>",
      "</fieldset>",
      '<div>',
      '<label class="label" for="expense-notes">Notes</label>',
      '<textarea class="field" id="expense-notes" name="notes" maxlength="500">' +
        escapeHtml(editing ? expenseItem.notes || "" : "") +
        "</textarea>",
      "</div>",
      '<div class="form-actions">',
      '<button class="btn btn-primary" type="submit">' + (editing ? "Save Expense" : "Add Expense") + "</button>",
      '<a class="btn btn-secondary" href="#/trip/' + trip.id + '">Cancel</a>',
      "</div>",
      "</form>",
      "</section>"
    ].join("");
  }

  function renderExpenseCard(trip, expenseItem) {
    var payer = findParticipant(trip, expenseItem.payerId);
    var canEdit = expenseItem.status !== "settled";
    return [
      '<article class="expense-card">',
      '<div class="expense-heading">',
      '<div>',
      '<div class="row-between" style="justify-content: flex-start; flex-wrap: wrap;">',
      '<h3 class="expense-title">' + escapeHtml(expenseItem.title) + "</h3>",
      '<span class="status-pill status-' + expenseItem.status + '">' + escapeHtml(expenseItem.status) + "</span>",
      "</div>",
      '<p class="expense-meta">' + escapeHtml(expenseItem.category) + " - " + formatDate(expenseItem.date) + "</p>",
      "</div>",
      '<div style="text-align: right;">',
      '<p class="expense-amount">' + formatCurrency(expenseItem.amount) + "</p>",
      '<p class="expense-payer">Paid by ' + escapeHtml(payer ? payer.name : "Unknown") + "</p>",
      "</div>",
      "</div>",
      expenseItem.notes ? '<p class="expense-note">' + escapeHtml(expenseItem.notes) + "</p>" : "",
      '<div class="expense-foot">',
      '<p class="expense-meta">Uploaded by ' +
        escapeHtml(expenseItem.createdBy && expenseItem.createdBy.username ? expenseItem.createdBy.username : "Unknown") +
        " - shared by " +
        expenseItem.shares.length +
        " participant" +
        (expenseItem.shares.length === 1 ? "" : "s") +
        "</p>",
      '<div class="expense-actions">',
      '<label class="sr-only" for="status-' + expenseItem.id + '">Status</label>',
      '<select class="field" style="min-height: 36px; width: auto; padding: 6px 28px 6px 10px;" id="status-' +
        expenseItem.id +
        '" data-action="change-status" data-trip-id="' +
        trip.id +
        '" data-expense-id="' +
        expenseItem.id +
        '"' +
        (canEdit ? "" : " disabled") +
        ">",
      expenseStatuses
        .map(function (status) {
          return (
            '<option value="' +
            status +
            '"' +
            (status === expenseItem.status ? " selected" : "") +
            ">" +
            status +
            "</option>"
          );
        })
        .join(""),
      "</select>",
      canEdit
        ? '<a class="mini-btn" href="#/trip/' +
          trip.id +
          "/expense/edit/" +
          expenseItem.id +
          '">Edit</a>' +
          '<button class="mini-btn danger" type="button" data-action="delete-expense" data-trip-id="' +
          trip.id +
          '" data-expense-id="' +
          expenseItem.id +
          '">Delete</button>'
        : '<span class="badge">Locked</span>',
      "</div>",
      "</div>",
      "</article>"
    ].join("");
  }

  function renderBalanceCard(balance) {
    var positive = balance.net >= 0;
    return [
      '<article class="balance-item">',
      '<div class="row-between">',
      '<h3 class="balance-name">' + escapeHtml(balance.participant.name) + "</h3>",
      '<span class="status-pill ' + (positive ? "status-approved" : "status-disputed") + '">' + (positive ? "Reimburse" : "Owes") + "</span>",
      "</div>",
      '<p class="balance-meta">Paid ' +
        formatCurrency(balance.paid) +
        ", owes " +
        formatCurrency(balance.owed) +
        "</p>",
      '<p class="balance-value ' + (positive ? "positive" : "negative") + '">' + formatCurrency(balance.net) + "</p>",
      "</article>"
    ].join("");
  }

  function renderSettlementItem(settlement, trip) {
    var creditor = findParticipant(trip, settlement.creditorId);
    var methods = creditor && creditor.paymentMethods ? creditor.paymentMethods : [];
    return [
      '<article class="settlement-item">',
      '<p>' + escapeHtml(settlement.label) + "</p>",
      methods.length
        ? '<div class="payment-methods">' +
          methods
            .map(function (method) {
              if (method.url) {
                return (
                  '<a class="mini-btn" href="' +
                  escapeAttr(method.url) +
                  '" target="_blank" rel="noopener noreferrer">Pay with ' +
                  escapeHtml(method.provider) +
                  "</a>"
                );
              }
              return (
                '<span class="badge">' +
                escapeHtml(method.provider) +
                ": " +
                escapeHtml(method.handle) +
                "</span>"
              );
            })
            .join("") +
          "</div>"
        : "",
      "</article>"
    ].join("");
  }

  function renderActivity(entry) {
    return [
      '<div class="activity-item">',
      '<p><strong>' + escapeHtml(entry.action) + "</strong></p>",
      '<p class="activity-date">' + formatDate(entry.createdAt) + "</p>",
      "</div>"
    ].join("");
  }

  function renderTripCard(trip) {
    var summary = summarizeTrip(trip);
    return [
      '<a class="card trip-card" href="#/trip/' + trip.id + '">',
      '<div class="trip-topline">',
      '<span class="trip-destination">' + escapeHtml(trip.destination || "Destination pending") + "</span>",
      '<span class="badge">' + escapeHtml(trip.role) + "</span>",
      "</div>",
      '<h2 class="trip-title">' + escapeHtml(trip.name) + "</h2>",
      '<p class="trip-date">' + formatDate(trip.startDate) + " - " + formatDate(trip.endDate) + "</p>",
      '<div class="metric-grid">',
      metric(summary.participantCount, "People"),
      metric(summary.expenseCount, "Expenses"),
      metric(formatCurrency(summary.totalCost), "Total"),
      "</div>",
      renderStatusBars(trip),
      '<div class="row-between" style="margin-top: 14px;">',
      '<span class="section-kicker">' + summary.settlements.length + " settlement suggestions</span>",
      '<span class="section-kicker">Open</span>',
      "</div>",
      "</a>"
    ].join("");
  }

  function renderStatusBars(trip) {
    var counts = statusCounts(trip);
    return (
      '<div class="progress-row" aria-label="Expense status mix">' +
      expenseStatuses
        .map(function (status) {
          return (
            '<span class="progress-cell status-' +
            status +
            '" title="' +
            status +
            ": " +
            counts[status] +
            '" style="opacity:' +
            (counts[status] ? "1" : "0.22") +
            '"></span>'
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderStatusSummary() {
    var counts = expenseStatuses.reduce(function (result, status) {
      result[status] = 0;
      return result;
    }, {});

    state.trips.forEach(function (trip) {
      trip.expenses.forEach(function (expenseItem) {
        counts[expenseItem.status] += 1;
      });
    });

    return (
      '<div class="participant-list">' +
      expenseStatuses
        .map(function (status) {
          return (
            '<div class="participant-item">' +
            '<div><p class="participant-name">' +
            status +
            '</p><p class="participant-meta">Expense status</p></div>' +
            '<span class="status-pill status-' +
            status +
            '">' +
            counts[status] +
            "</span>" +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderAccount() {
    return [
      renderPageHeader({
        eyebrow: "Account",
        title: currentUser.name,
        description: currentUser.email
      }),
      '<div class="layout-two">',
      '<section class="card panel account-block">',
      '<div class="row-between">',
      '<div>',
      '<span class="avatar">MD</span>',
      '<h2 class="section-title" style="margin-top: 14px;">Demo profile</h2>',
      '<p class="description" style="margin-top: 0;">Local browser state is active for this static build.</p>',
      "</div>",
      '<button class="btn btn-ghost" type="button" data-action="reset-demo">Reset data</button>',
      "</div>",
      "</section>",
      '<aside class="card panel">',
      '<h2 class="section-title">Payment handles</h2>',
      '<div class="payment-methods">',
      '<span class="badge">Venmo: @miadonovan</span>',
      '<span class="badge">PayPal: mia@example.test</span>',
      "</div>",
      "</aside>",
      "</div>"
    ].join("");
  }

  function renderNotFound() {
    return renderEmptyState("Trip not found", "The selected trip is not in the demo data.", "Back to trips", "#/trips");
  }

  function renderPageHeader(config) {
    return [
      '<header class="page-header">',
      "<div>",
      config.eyebrow ? '<p class="eyebrow">' + escapeHtml(config.eyebrow) + "</p>" : "",
      '<h1 class="title">' + escapeHtml(config.title) + "</h1>",
      config.description ? '<p class="description">' + config.description + "</p>" : "",
      "</div>",
      config.actions ? '<div class="page-header-actions">' + config.actions + "</div>" : "",
      "</header>"
    ].join("");
  }

  function renderFilterRow(tripId, activeFilter) {
    var filters = [
      ["all", "All expenses"],
      ["my", "My expenses"],
      ["needs-review", "Needs review"],
      ["disputed", "Disputed"],
      ["unsettled", "Unsettled"]
    ];
    return (
      '<div class="filter-row" style="margin-bottom: 14px; justify-content: flex-start;">' +
      filters
        .map(function (filter) {
          return (
            '<a class="chip' +
            (activeFilter === filter[0] ? " active" : "") +
            '" href="#/trip/' +
            tripId +
            "?filter=" +
            filter[0] +
            '">' +
            filter[1] +
            "</a>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderField(label, name, type, value, placeholder, required, extraAttrs) {
    var id = "field-" + name + "-" + makeStableId(label);
    return [
      "<div>",
      '<label class="label" for="' + id + '">' + escapeHtml(label) + "</label>",
      '<input class="field" id="' +
        id +
        '" name="' +
        name +
        '" type="' +
        type +
        '" value="' +
        escapeAttr(value || "") +
        '" placeholder="' +
        escapeAttr(placeholder || "") +
        '"' +
        (required ? " required" : "") +
        (extraAttrs ? " " + extraAttrs : "") +
        " />",
      "</div>"
    ].join("");
  }

  function renderSelect(label, name, options, selected) {
    var id = "field-" + name + "-" + makeStableId(label);
    return [
      "<div>",
      '<label class="label" for="' + id + '">' + escapeHtml(label) + "</label>",
      '<select class="field" id="' + id + '" name="' + name + '" required>',
      options
        .map(function (option) {
          var value = typeof option === "string" ? option : option.value;
          var optionLabel = typeof option === "string" ? option : option.label;
          return (
            '<option value="' +
            escapeAttr(value) +
            '"' +
            (value === selected ? " selected" : "") +
            ">" +
            escapeHtml(optionLabel) +
            "</option>"
          );
        })
        .join(""),
      "</select>",
      "</div>"
    ].join("");
  }

  function statCard(label, value, note, accentClass) {
    return [
      '<article class="card stat-card">',
      '<div class="stat-accent ' + accentClass + '"></div>',
      '<p class="stat-label">' + escapeHtml(label) + "</p>",
      '<p class="stat-value">' + escapeHtml(value) + "</p>",
      '<p class="stat-note">' + escapeHtml(note) + "</p>",
      "</article>"
    ].join("");
  }

  function metric(value, label) {
    return (
      '<span class="metric"><strong>' +
      escapeHtml(value) +
      "</strong>" +
      escapeHtml(label) +
      "</span>"
    );
  }

  function renderEmptyState(title, description, actionLabel, actionHref) {
    return [
      '<div class="card empty-state">',
      '<div class="empty-mark"><img src="assets/mark-512.png" alt="" /></div>',
      '<h2>' + escapeHtml(title) + "</h2>",
      '<p class="empty-copy">' + escapeHtml(description) + "</p>",
      actionLabel && actionHref
        ? '<a class="btn btn-primary" style="margin-top: 18px;" href="' +
          actionHref +
          '">' +
          escapeHtml(actionLabel) +
          "</a>"
        : "",
      "</div>"
    ].join("");
  }

  function renderInlineEmpty(message) {
    return '<div class="inline-alert">' + escapeHtml(message) + "</div>";
  }

  function handleClick(event) {
    var target = event.target.closest("[data-action]");
    if (!target) return;

    var action = target.dataset.action;
    if (action === "toggle-theme") {
      event.preventDefault();
      toggleTheme();
      render();
      return;
    }

    if (action === "reset-demo") {
      event.preventDefault();
      if (window.confirm("Reset the static demo data?")) {
        resetState();
      }
      return;
    }

    if (action === "delete-trip") {
      event.preventDefault();
      deleteTrip(target.dataset.tripId);
      return;
    }

    if (action === "delete-participant") {
      event.preventDefault();
      deleteParticipant(target.dataset.tripId, target.dataset.participantId);
      return;
    }

    if (action === "delete-expense") {
      event.preventDefault();
      deleteExpense(target.dataset.tripId, target.dataset.expenseId);
    }
  }

  function handleSubmit(event) {
    var form = event.target.closest("form[data-form]");
    if (!form) return;
    event.preventDefault();

    if (form.dataset.form === "trip-search") {
      var searchValue = new FormData(form).get("search") || "";
      var query = String(searchValue).trim();
      window.location.hash = query ? "#/trips?search=" + encodeURIComponent(query) : "#/trips";
      return;
    }

    if (form.dataset.form === "new-trip") {
      submitNewTrip(form);
      return;
    }

    if (form.dataset.form === "participant") {
      submitParticipant(form);
      return;
    }

    if (form.dataset.form === "expense") {
      submitExpense(form);
    }
  }

  function handleChange(event) {
    var target = event.target.closest("[data-action='change-status']");
    if (!target) return;
    var trip = findTrip(target.dataset.tripId);
    if (!trip) return;
    var expenseItem = findExpense(trip, target.dataset.expenseId);
    if (!expenseItem) return;
    expenseItem.status = target.value;
    addAudit(trip, expenseItem.title + " marked " + target.value);
    saveState();
    render();
  }

  function submitNewTrip(form) {
    var data = new FormData(form);
    var names = String(data.get("participants") || "")
      .split("\n")
      .map(function (name) {
        return name.trim();
      })
      .filter(Boolean);
    var tripId = makeId("trip");
    var participants = [
      participant(makeId("participant"), currentUser.name, currentUser.email, true, [
        paymentMethod("Venmo", "@miadonovan", "https://venmo.com/miadonovan")
      ])
    ];

    names.forEach(function (name) {
      if (name.toLowerCase() !== currentUser.name.toLowerCase()) {
        participants.push(participant(makeId("participant"), name, "", false, []));
      }
    });

    state.trips.unshift({
      id: tripId,
      name: String(data.get("name") || "").trim(),
      destination: String(data.get("destination") || "").trim(),
      startDate: String(data.get("startDate") || ""),
      endDate: String(data.get("endDate") || ""),
      role: "owner",
      participants: participants,
      expenses: [],
      auditLogs: [audit("Trip created", todayInput())]
    });
    saveState();
    window.location.hash = "#/trip/" + tripId;
  }

  function submitParticipant(form) {
    var trip = findTrip(form.dataset.tripId);
    if (!trip) return;
    var data = new FormData(form);
    var name = String(data.get("name") || "").trim();
    var email = String(data.get("email") || "").trim();
    if (!name) return;
    trip.participants.push(participant(makeId("participant"), name, email, false, []));
    addAudit(trip, name + " added");
    saveState();
    render();
  }

  function submitExpense(form) {
    var trip = findTrip(form.dataset.tripId);
    if (!trip) return;
    var data = new FormData(form);
    var amount = roundCurrency(Number(data.get("amount")));
    var sharedParticipantIds = data.getAll("sharedParticipantIds").map(String);
    if (!amount || amount <= 0) {
      window.alert("Enter a valid amount.");
      return;
    }
    if (!sharedParticipantIds.length) {
      window.alert("Choose at least one participant.");
      return;
    }

    var expenseId = form.dataset.expenseId;
    var existing = expenseId ? findExpense(trip, expenseId) : null;
    var nextExpense = {
      id: existing ? existing.id : makeId("expense"),
      title: String(data.get("title") || "").trim(),
      amount: amount,
      category: String(data.get("category") || categories[0]),
      payerId: String(data.get("payerId") || ""),
      date: String(data.get("date") || todayInput()),
      status: String(data.get("status") || "submitted"),
      notes: String(data.get("notes") || "").trim(),
      createdByUserId: existing ? existing.createdByUserId : currentUser.id,
      createdBy: existing
        ? existing.createdBy
        : {
            username: currentUser.name,
            email: currentUser.email
          },
      shares: makeShares(amount, sharedParticipantIds)
    };

    if (existing) {
      var index = trip.expenses.findIndex(function (item) {
        return item.id === existing.id;
      });
      trip.expenses[index] = nextExpense;
      addAudit(trip, nextExpense.title + " updated");
    } else {
      trip.expenses.unshift(nextExpense);
      addAudit(trip, nextExpense.title + " added");
    }

    saveState();
    window.location.hash = "#/trip/" + trip.id;
  }

  function deleteTrip(tripId) {
    var trip = findTrip(tripId);
    if (!trip) return;
    if (!window.confirm("Delete " + trip.name + "?")) return;
    state.trips = state.trips.filter(function (item) {
      return item.id !== tripId;
    });
    saveState();
    window.location.hash = "#/trips";
  }

  function deleteParticipant(tripId, participantId) {
    var trip = findTrip(tripId);
    if (!trip) return;
    var participantItem = findParticipant(trip, participantId);
    if (!participantItem) return;
    if (!window.confirm("Delete " + participantItem.name + "?")) return;
    trip.participants = trip.participants.filter(function (item) {
      return item.id !== participantId;
    });
    addAudit(trip, participantItem.name + " removed");
    saveState();
    render();
  }

  function deleteExpense(tripId, expenseId) {
    var trip = findTrip(tripId);
    if (!trip) return;
    var expenseItem = findExpense(trip, expenseId);
    if (!expenseItem) return;
    if (!window.confirm("Delete " + expenseItem.title + "?")) return;
    trip.expenses = trip.expenses.filter(function (item) {
      return item.id !== expenseId;
    });
    addAudit(trip, expenseItem.title + " deleted");
    saveState();
    render();
  }

  function addAudit(trip, action) {
    trip.auditLogs.push(audit(action, todayInput()));
    state.updatedAt = new Date().toISOString();
  }

  function summarizeTrip(trip) {
    var balanceExpenses = trip.expenses.filter(function (expenseItem) {
      return canIncludeExpenseInBalances(expenseItem.status);
    });
    var calculation = calculateBalances(trip.participants, balanceExpenses);
    var totalCost = balanceExpenses.reduce(function (sum, expenseItem) {
      return roundCurrency(sum + Number(expenseItem.amount));
    }, 0);

    return {
      trip: trip,
      participantCount: trip.participants.length,
      expenseCount: trip.expenses.length,
      balanceExpenseCount: balanceExpenses.length,
      totalCost: totalCost,
      balances: calculation.balances,
      settlements: calculation.settlements
    };
  }

  function calculateBalances(participants, expenses) {
    var totals = new Map();

    participants.forEach(function (participantItem) {
      totals.set(participantItem.id, {
        participant: participantItem,
        paid: 0,
        owed: 0,
        net: 0
      });
    });

    expenses.forEach(function (expenseItem) {
      var payer = totals.get(expenseItem.payerId);
      if (payer) {
        payer.paid = roundCurrency(payer.paid + Number(expenseItem.amount));
      }

      if (expenseItem.shares.length > 0) {
        expenseItem.shares.forEach(function (share) {
          var participantItem = totals.get(share.participantId);
          if (participantItem) {
            participantItem.owed = roundCurrency(participantItem.owed + Number(share.shareAmount));
          }
        });
      } else {
        var equalShares = calculateEqualShares(Number(expenseItem.amount), participants.length);
        participants.forEach(function (participantItem, index) {
          var summary = totals.get(participantItem.id);
          if (summary) {
            summary.owed = roundCurrency(summary.owed + equalShares[index]);
          }
        });
      }
    });

    totals.forEach(function (summary) {
      summary.net = roundCurrency(summary.paid - summary.owed);
    });

    var balances = Array.from(totals.values());
    return {
      balances: balances,
      settlements: generateSettlementSuggestions(balances)
    };
  }

  function generateSettlementSuggestions(balances) {
    var creditors = balances
      .filter(function (item) {
        return item.net > 0;
      })
      .map(clone)
      .sort(function (a, b) {
        return b.net - a.net;
      });
    var debtors = balances
      .filter(function (item) {
        return item.net < 0;
      })
      .map(clone)
      .sort(function (a, b) {
        return a.net - b.net;
      });
    var settlements = [];
    var debtorIndex = 0;
    var creditorIndex = 0;

    while (debtorIndex < debtors.length && creditorIndex < creditors.length) {
      var debtor = debtors[debtorIndex];
      var creditor = creditors[creditorIndex];
      var amount = roundCurrency(Math.min(creditor.net, -debtor.net));

      if (amount <= 0) break;

      settlements.push({
        debtorId: debtor.participant.id,
        debtorName: debtor.participant.name,
        creditorId: creditor.participant.id,
        creditorName: creditor.participant.name,
        amount: amount,
        label:
          debtor.participant.name +
          " owes " +
          creditor.participant.name +
          " " +
          formatCurrency(amount)
      });

      debtor.net = roundCurrency(debtor.net + amount);
      creditor.net = roundCurrency(creditor.net - amount);

      if (Math.abs(debtor.net) < 0.01) debtorIndex += 1;
      if (Math.abs(creditor.net) < 0.01) creditorIndex += 1;
    }

    return settlements;
  }

  function calculateEqualShares(amount, participantCount) {
    if (participantCount <= 0) return [];
    var cents = Math.round(amount * 100);
    var base = Math.floor(cents / participantCount);
    var remainder = cents % participantCount;
    return Array.from({ length: participantCount }, function (_, index) {
      return (base + (index < remainder ? 1 : 0)) / 100;
    });
  }

  function filterExpenses(expenses, filter) {
    return expenses
      .filter(function (expenseItem) {
        if (filter === "my") return expenseItem.createdByUserId === currentUser.id;
        if (filter === "needs-review") return ["draft", "submitted"].indexOf(expenseItem.status) !== -1;
        if (filter === "disputed") return expenseItem.status === "disputed";
        if (filter === "unsettled") return expenseItem.status !== "draft" && expenseItem.status !== "settled";
        return true;
      })
      .slice()
      .sort(function (a, b) {
        return String(b.date).localeCompare(String(a.date));
      });
  }

  function canIncludeExpenseInBalances(status) {
    return normalizeExpenseStatus(status) !== "draft";
  }

  function normalizeExpenseStatus(status) {
    return expenseStatuses.indexOf(status) !== -1 ? status : "submitted";
  }

  function statusCounts(trip) {
    return expenseStatuses.reduce(function (result, status) {
      result[status] = trip.expenses.filter(function (expenseItem) {
        return expenseItem.status === status;
      }).length;
      return result;
    }, {});
  }

  function countExpenses(predicate) {
    return state.trips.reduce(function (sum, trip) {
      return (
        sum +
        trip.expenses.filter(function (expenseItem) {
          return predicate(expenseItem, trip);
        }).length
      );
    }, 0);
  }

  function findTrip(tripId) {
    return state.trips.find(function (trip) {
      return trip.id === tripId;
    });
  }

  function findParticipant(trip, participantId) {
    return trip.participants.find(function (participantItem) {
      return participantItem.id === participantId;
    });
  }

  function findExpense(trip, expenseId) {
    return trip.expenses.find(function (expenseItem) {
      return expenseItem.id === expenseId;
    });
  }

  function getRoute() {
    var hash = window.location.hash.replace(/^#/, "") || "/dashboard";
    var parts = hash.split("?");
    var path = parts[0] || "/dashboard";
    return {
      path: path,
      query: new URLSearchParams(parts[1] || ""),
      segments: path.split("/").filter(Boolean)
    };
  }

  function toggleTheme() {
    var next = isDarkTheme() ? "light" : "dark";
    window.localStorage.setItem(THEME_KEY, next);
    applyTheme();
  }

  function applyTheme() {
    document.documentElement.classList.toggle("dark", isDarkTheme());
  }

  function isDarkTheme() {
    return window.localStorage.getItem(THEME_KEY) === "dark";
  }

  function formatCurrency(value) {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD"
    }).format(Number(value) || 0);
  }

  function formatDate(value) {
    if (!value) return "TBD";
    var date = parseLocalDate(value);
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    }).format(date);
  }

  function parseLocalDate(value) {
    if (value instanceof Date) return value;
    var parts = String(value).slice(0, 10).split("-");
    if (parts.length === 3) {
      return new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    }
    return new Date(value);
  }

  function todayInput() {
    var date = new Date();
    var month = String(date.getMonth() + 1).padStart(2, "0");
    var day = String(date.getDate()).padStart(2, "0");
    return date.getFullYear() + "-" + month + "-" + day;
  }

  function roundCurrency(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
  }

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function makeId(prefix) {
    return (
      prefix +
      "-" +
      Date.now().toString(36) +
      "-" +
      Math.random().toString(36).slice(2, 8)
    );
  }

  function makeStableId(value) {
    return String(value)
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  function escapeHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function escapeAttr(value) {
    return escapeHtml(value).replace(/`/g, "&#96;");
  }
})();
