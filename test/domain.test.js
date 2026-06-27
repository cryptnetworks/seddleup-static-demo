const assert = require("node:assert/strict");
const test = require("node:test");

const domain = require("../src/domain");

const participants = [
  { id: "mia", name: "Mia Donovan" },
  { id: "avery", name: "Avery Chen" },
  { id: "jordan", name: "Jordan Blake" }
];

test("calculateEqualShares splits cents without losing the total", () => {
  const shares = domain.calculateEqualShares(10, 3);

  assert.deepEqual(shares, [3.34, 3.33, 3.33]);
  assert.equal(domain.roundCurrency(shares.reduce((sum, share) => sum + share, 0)), 10);
});

test("calculateBalances totals paid, owed, net, and settlement suggestions", () => {
  const calculation = domain.calculateBalances(participants, [
    {
      id: "lodging",
      amount: 90,
      payerId: "mia",
      shares: [
        { participantId: "mia", shareAmount: 30 },
        { participantId: "avery", shareAmount: 30 },
        { participantId: "jordan", shareAmount: 30 }
      ]
    },
    {
      id: "supplies",
      amount: 30,
      payerId: "avery",
      shares: []
    }
  ]);

  assert.deepEqual(
    calculation.balances.map((balance) => ({
      id: balance.participant.id,
      paid: balance.paid,
      owed: balance.owed,
      net: balance.net
    })),
    [
      { id: "mia", paid: 90, owed: 40, net: 50 },
      { id: "avery", paid: 30, owed: 40, net: -10 },
      { id: "jordan", paid: 0, owed: 40, net: -40 }
    ]
  );

  assert.deepEqual(
    calculation.settlements.map((settlement) => ({
      debtorId: settlement.debtorId,
      creditorId: settlement.creditorId,
      amount: settlement.amount
    })),
    [
      { debtorId: "jordan", creditorId: "mia", amount: 40 },
      { debtorId: "avery", creditorId: "mia", amount: 10 }
    ]
  );
});

test("summarizeTrip excludes draft expenses from balances", () => {
  const trip = {
    id: "trip-rocky",
    participants: participants,
    expenses: [
      {
        id: "approved",
        amount: 60,
        payerId: "mia",
        status: "approved",
        shares: []
      },
      {
        id: "draft",
        amount: 999,
        payerId: "jordan",
        status: "draft",
        shares: []
      }
    ]
  };

  const summary = domain.summarizeTrip(trip);

  assert.equal(summary.participantCount, 3);
  assert.equal(summary.expenseCount, 2);
  assert.equal(summary.balanceExpenseCount, 1);
  assert.equal(summary.totalCost, 60);
  assert.equal(summary.balances.find((balance) => balance.participant.id === "mia").net, 40);
});

test("filterExpenses applies app filters and keeps newest dates first", () => {
  const expenses = [
    { id: "draft", status: "draft", createdByUserId: "mia", date: "2026-06-01" },
    { id: "submitted", status: "submitted", createdByUserId: "avery", date: "2026-06-04" },
    { id: "disputed", status: "disputed", createdByUserId: "mia", date: "2026-06-03" },
    { id: "settled", status: "settled", createdByUserId: "jordan", date: "2026-06-02" }
  ];

  assert.deepEqual(domain.filterExpenses(expenses, "my", "mia").map((expense) => expense.id), [
    "disputed",
    "draft"
  ]);
  assert.deepEqual(domain.filterExpenses(expenses, "needs-review", "mia").map((expense) => expense.id), [
    "submitted",
    "draft"
  ]);
  assert.deepEqual(domain.filterExpenses(expenses, "unsettled", "mia").map((expense) => expense.id), [
    "submitted",
    "disputed"
  ]);
});

test("status helpers normalize unknown statuses and count known statuses", () => {
  const trip = {
    expenses: [
      { status: "draft" },
      { status: "submitted" },
      { status: "approved" },
      { status: "approved" },
      { status: "settled" }
    ]
  };

  assert.equal(domain.normalizeExpenseStatus("approved"), "approved");
  assert.equal(domain.normalizeExpenseStatus("unknown"), "submitted");
  assert.equal(domain.canIncludeExpenseInBalances("draft"), false);
  assert.equal(domain.canIncludeExpenseInBalances("submitted"), true);
  assert.deepEqual(domain.statusCounts(trip), {
    draft: 1,
    submitted: 1,
    approved: 2,
    disputed: 0,
    settled: 1
  });
});

test("format and escaping helpers keep UI output predictable", () => {
  assert.equal(domain.formatCurrency(12.5), "$12.50");
  assert.equal(domain.formatDate("2026-06-19"), "Jun 19, 2026");
  assert.equal(domain.escapeHtml("<Mia & Avery>"), "&lt;Mia &amp; Avery&gt;");
  assert.equal(domain.escapeAttr("`quote`"), "&#96;quote&#96;");
});
