from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework.authtoken.views import obtain_auth_token

# Expenses app imports (only expense-related views)
from expenses.views import (
    PaymentMethodViewSet, ExpenseViewSet
)

# Recurring app imports
from recurring.views import (
    RecurringExpenseViewSet, RecurringExpenseLogViewSet
)

# Other imports
from budgets.views import BudgetViewSet, BudgetAlertViewSet
from groups.views import GroupViewSet, GroupExpenseViewSet, GroupMembershipViewSet
from categories.views import CategoryViewSet
from accounts.views import UserRegistrationView, UserViewSet, ProfileViewSet, UserPreferenceViewSet
# Analytics
from analytics.views import (
    AnalyticsViewSet, SpendingPatternViewSet, 
    AnomalyRuleViewSet, FinancialHealthMetricViewSet
)
#  Reports
from reports.views import ReportViewSet, ScheduledReportViewSet


router = DefaultRouter()

# Accounts
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'preferences', UserPreferenceViewSet, basename='preference')

# Categories
router.register(r'categories', CategoryViewSet, basename='category')

# Expenses
router.register(r'payment-methods', PaymentMethodViewSet, basename='paymentmethod')
router.register(r'expenses', ExpenseViewSet, basename='expense')

# Recurring
router.register(r'recurring-expenses', RecurringExpenseViewSet, basename='recurringexpense')
router.register(r'recurring-logs', RecurringExpenseLogViewSet, basename='recurringexpenselog')

# Budgets
router.register(r'budgets', BudgetViewSet, basename='budget')
router.register(r'budget-alerts', BudgetAlertViewSet, basename='budgetalert')

# Groups
router.register(r'groups', GroupViewSet, basename='group')
router.register(r'group-expenses', GroupExpenseViewSet, basename='groupexpense')
router.register(r'group-memberships', GroupMembershipViewSet, basename='groupmembership')

# Analytics
router.register(r'analytics/dashboard', AnalyticsViewSet, basename='analytics-dashboard')
router.register(r'analytics/spending-patterns', SpendingPatternViewSet, basename='spendingpattern')
router.register(r'analytics/anomaly-rules', AnomalyRuleViewSet, basename='anomalyrule')
router.register(r'analytics/health-metrics', FinancialHealthMetricViewSet, basename='healthmetric')

# Reports
router.register(r'reports', ReportViewSet, basename='report')
router.register(r'scheduled-reports', ScheduledReportViewSet, basename='scheduledreport')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/register/', UserRegistrationView.as_view(), name='user-register'),
    path('api/auth/', include('rest_framework.urls')),
    path('api/token/', obtain_auth_token, name='api_token_auth'),
]