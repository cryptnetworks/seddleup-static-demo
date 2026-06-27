(function (root, factory) {
  "use strict";

  if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.SeddleUpDomain = factory();
  }
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  var expenseStatuses = ["draft", "submitted", "approved", "disputed", "settled"];

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

  function filterExpenses(expenses, filter, currentUserId) {
    return expenses
      .filter(function (expenseItem) {
        if (filter === "my") return expenseItem.createdByUserId === currentUserId;
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

  function roundCurrency(value) {
    return Math.round((Number(value) + Number.EPSILON) * 100) / 100;
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

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  return {
    expenseStatuses: expenseStatuses.slice(),
    summarizeTrip: summarizeTrip,
    calculateBalances: calculateBalances,
    generateSettlementSuggestions: generateSettlementSuggestions,
    calculateEqualShares: calculateEqualShares,
    filterExpenses: filterExpenses,
    canIncludeExpenseInBalances: canIncludeExpenseInBalances,
    normalizeExpenseStatus: normalizeExpenseStatus,
    statusCounts: statusCounts,
    formatCurrency: formatCurrency,
    formatDate: formatDate,
    parseLocalDate: parseLocalDate,
    roundCurrency: roundCurrency,
    escapeHtml: escapeHtml,
    escapeAttr: escapeAttr
  };
});
