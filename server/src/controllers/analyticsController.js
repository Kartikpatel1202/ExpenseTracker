import Expense from "../models/Expense.js";

export const getSummary = async (req, res,next) => {
  try {
    const expenses = await Expense.find();
    let totalIncome = 0;
    let totalExpense = 0;
    let highestExpense = null;
    expenses.forEach((expense) => {

      if (expense.type === "Income") {
        totalIncome += expense.amount;
      } else {
    totalExpense += expense.amount;
    if (
        highestExpense === null ||
        expense.amount > highestExpense.amount
    ) {
        highestExpense = expense;
    }
}

    });
    const balance = totalIncome - totalExpense;

    return res.status(200).json({
      success: true,
      data: {
        totalIncome,
        totalExpense,
        balance,
        totalTransactions: expenses.length,
        highestExpense,
      },
    });

  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });

  }
};
export const getCategoryWiseAnalytics = async (req, res,next) => {
    try {
        const analytics = await Expense.aggregate([
            {
                $match: {
                    type: "Expense"
                }
            },
            {
                $group: {
                    _id: "$category",
                    totalAmount: {
                        $sum: "$amount"
                    }
                }
            }
        ]);
        return res.status(200).json({
            success: true,
            data: analytics
        });
    } catch(error){
    next(error);
}
};
export const getMonthWiseAnalytics = async (req, res,next) => {
  try {

    const analytics = await Expense.aggregate([

      {
        $group: {

          _id: {
            month: {
              $month: "$date"
            }
          },

          totalIncome: {
            $sum: {
              $cond: [
                { $eq: ["$type", "Income"] },
                "$amount",
                0
              ]
            }
          },

          totalExpense: {
            $sum: {
              $cond: [
                { $eq: ["$type", "Expense"] },
                "$amount",
                0
              ]
            }
          }

        }
      },

      {
        $sort: {
          "_id.month": 1
        }
      }

    ]);

    return res.status(200).json({
      success: true,
      data: analytics
    });

  } catch(error){
    next(error);
}
};