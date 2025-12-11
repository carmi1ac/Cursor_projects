"""
Business Metrics Visualization for HR Dataset
This script creates pie charts, bar graphs, and scatter plots for core business metrics.
"""

import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import numpy as np
from datetime import datetime

# Set style for better-looking plots
sns.set_style("whitegrid")
plt.rcParams['figure.figsize'] = (15, 10)

# Read the CSV file
df = pd.read_csv('sample_hr_dataset.csv')

# Data cleaning and preparation
# Convert date columns
df['DateofHire'] = pd.to_datetime(df['DateofHire'], errors='coerce')
df['DateofTermination'] = pd.to_datetime(df['DateofTermination'], errors='coerce')

# Clean up department names (remove extra spaces)
df['Department'] = df['Department'].str.strip()

# Convert numeric columns, handling any non-numeric values
df['Salary'] = pd.to_numeric(df['Salary'], errors='coerce')
df['EngagementSurvey'] = pd.to_numeric(df['EngagementSurvey'], errors='coerce')
df['EmpSatisfaction'] = pd.to_numeric(df['EmpSatisfaction'], errors='coerce')
df['Absences'] = pd.to_numeric(df['Absences'], errors='coerce')
df['DaysLateLast30'] = pd.to_numeric(df['DaysLateLast30'], errors='coerce')

# Create a figure with subplots
fig = plt.figure(figsize=(20, 24))

# ==================== PIE CHARTS ====================

# 1. Department Distribution (Pie Chart)
ax1 = plt.subplot(4, 3, 1)
dept_counts = df['Department'].value_counts()
colors = plt.cm.Set3(np.linspace(0, 1, len(dept_counts)))
ax1.pie(dept_counts.values, labels=dept_counts.index, autopct='%1.1f%%', 
        startangle=90, colors=colors)
ax1.set_title('Employee Distribution by Department', fontsize=14, fontweight='bold')

# 2. Employment Status (Pie Chart)
ax2 = plt.subplot(4, 3, 2)
status_counts = df['EmploymentStatus'].value_counts()
colors2 = plt.cm.Pastel1(np.linspace(0, 1, len(status_counts)))
ax2.pie(status_counts.values, labels=status_counts.index, autopct='%1.1f%%',
        startangle=90, colors=colors2)
ax2.set_title('Employment Status Distribution', fontsize=14, fontweight='bold')

# 3. Performance Score Distribution (Pie Chart)
ax3 = plt.subplot(4, 3, 3)
perf_counts = df['PerformanceScore'].value_counts()
colors3 = plt.cm.Set2(np.linspace(0, 1, len(perf_counts)))
ax3.pie(perf_counts.values, labels=perf_counts.index, autopct='%1.1f%%',
        startangle=90, colors=colors3)
ax3.set_title('Performance Score Distribution', fontsize=14, fontweight='bold')

# 4. Recruitment Source Distribution (Pie Chart)
ax4 = plt.subplot(4, 3, 4)
recruit_counts = df['RecruitmentSource'].value_counts()
# Limit to top 8 for readability
top_recruit = recruit_counts.head(8)
colors4 = plt.cm.tab20(np.linspace(0, 1, len(top_recruit)))
ax4.pie(top_recruit.values, labels=top_recruit.index, autopct='%1.1f%%',
        startangle=90, colors=colors4)
ax4.set_title('Top Recruitment Sources', fontsize=14, fontweight='bold')

# 5. Gender Distribution (Pie Chart)
ax5 = plt.subplot(4, 3, 5)
gender_counts = df['Sex'].value_counts()
colors5 = plt.cm.Accent(np.linspace(0, 1, len(gender_counts)))
ax5.pie(gender_counts.values, labels=gender_counts.index, autopct='%1.1f%%',
        startangle=90, colors=colors5)
ax5.set_title('Gender Distribution', fontsize=14, fontweight='bold')

# 6. Marital Status Distribution (Pie Chart)
ax6 = plt.subplot(4, 3, 6)
marital_counts = df['MaritalDesc'].value_counts()
colors6 = plt.cm.Pastel2(np.linspace(0, 1, len(marital_counts)))
ax6.pie(marital_counts.values, labels=marital_counts.index, autopct='%1.1f%%',
        startangle=90, colors=colors6)
ax6.set_title('Marital Status Distribution', fontsize=14, fontweight='bold')

# ==================== BAR GRAPHS ====================

# 7. Average Salary by Department (Bar Chart)
ax7 = plt.subplot(4, 3, 7)
dept_salary = df.groupby('Department')['Salary'].mean().sort_values(ascending=False)
bars = ax7.bar(range(len(dept_salary)), dept_salary.values, color=plt.cm.viridis(np.linspace(0, 1, len(dept_salary))))
ax7.set_xticks(range(len(dept_salary)))
ax7.set_xticklabels(dept_salary.index, rotation=45, ha='right')
ax7.set_ylabel('Average Salary ($)', fontsize=12)
ax7.set_title('Average Salary by Department', fontsize=14, fontweight='bold')
ax7.grid(axis='y', alpha=0.3)
# Add value labels on bars
for i, (idx, val) in enumerate(dept_salary.items()):
    ax7.text(i, val, f'${val:,.0f}', ha='center', va='bottom', fontsize=9)

# 8. Employee Count by Department (Bar Chart)
ax8 = plt.subplot(4, 3, 8)
dept_counts_bar = df['Department'].value_counts().sort_values(ascending=False)
bars = ax8.bar(range(len(dept_counts_bar)), dept_counts_bar.values, 
               color=plt.cm.plasma(np.linspace(0, 1, len(dept_counts_bar))))
ax8.set_xticks(range(len(dept_counts_bar)))
ax8.set_xticklabels(dept_counts_bar.index, rotation=45, ha='right')
ax8.set_ylabel('Number of Employees', fontsize=12)
ax8.set_title('Employee Count by Department', fontsize=14, fontweight='bold')
ax8.grid(axis='y', alpha=0.3)
# Add value labels on bars
for i, (idx, val) in enumerate(dept_counts_bar.items()):
    ax8.text(i, val, str(val), ha='center', va='bottom', fontsize=9)

# 9. Termination Reasons (Bar Chart)
ax9 = plt.subplot(4, 3, 9)
terminated = df[df['Termd'] == 1]
if len(terminated) > 0:
    term_reasons = terminated['TermReason'].value_counts().head(8)
    bars = ax9.barh(range(len(term_reasons)), term_reasons.values,
                    color=plt.cm.Reds(np.linspace(0.3, 0.9, len(term_reasons))))
    ax9.set_yticks(range(len(term_reasons)))
    ax9.set_yticklabels(term_reasons.index)
    ax9.set_xlabel('Number of Terminations', fontsize=12)
    ax9.set_title('Top Termination Reasons', fontsize=14, fontweight='bold')
    ax9.grid(axis='x', alpha=0.3)
    # Add value labels
    for i, (idx, val) in enumerate(term_reasons.items()):
        ax9.text(val, i, str(val), ha='left', va='center', fontsize=9)
else:
    ax9.text(0.5, 0.5, 'No termination data', ha='center', va='center', fontsize=12)
    ax9.set_title('Top Termination Reasons', fontsize=14, fontweight='bold')

# 10. Performance Score Count (Bar Chart)
ax10 = plt.subplot(4, 3, 10)
perf_order = ['PIP', 'Needs Improvement', 'Fully Meets', 'Exceeds']
perf_order = [p for p in perf_order if p in df['PerformanceScore'].values]
perf_counts_bar = df['PerformanceScore'].value_counts().reindex(perf_order, fill_value=0)
bars = ax10.bar(range(len(perf_counts_bar)), perf_counts_bar.values,
                color=plt.cm.RdYlGn(np.linspace(0.2, 0.8, len(perf_counts_bar))))
ax10.set_xticks(range(len(perf_counts_bar)))
ax10.set_xticklabels(perf_counts_bar.index, rotation=45, ha='right')
ax10.set_ylabel('Number of Employees', fontsize=12)
ax10.set_title('Performance Score Distribution (Bar)', fontsize=14, fontweight='bold')
ax10.grid(axis='y', alpha=0.3)
# Add value labels
for i, (idx, val) in enumerate(perf_counts_bar.items()):
    ax10.text(i, val, str(val), ha='center', va='bottom', fontsize=9)

# 11. Average Engagement Survey by Department (Bar Chart)
ax11 = plt.subplot(4, 3, 11)
dept_engagement = df.groupby('Department')['EngagementSurvey'].mean().sort_values(ascending=False)
bars = ax11.bar(range(len(dept_engagement)), dept_engagement.values,
                color=plt.cm.coolwarm(np.linspace(0, 1, len(dept_engagement))))
ax11.set_xticks(range(len(dept_engagement)))
ax11.set_xticklabels(dept_engagement.index, rotation=45, ha='right')
ax11.set_ylabel('Average Engagement Score', fontsize=12)
ax11.set_title('Average Engagement Survey by Department', fontsize=14, fontweight='bold')
ax11.grid(axis='y', alpha=0.3)
# Add value labels
for i, (idx, val) in enumerate(dept_engagement.items()):
    ax11.text(i, val, f'{val:.2f}', ha='center', va='bottom', fontsize=9)

# 12. Recruitment Source Count (Bar Chart)
ax12 = plt.subplot(4, 3, 12)
recruit_counts_bar = df['RecruitmentSource'].value_counts().head(10)
bars = ax12.bar(range(len(recruit_counts_bar)), recruit_counts_bar.values,
                color=plt.cm.tab20c(np.linspace(0, 1, len(recruit_counts_bar))))
ax12.set_xticks(range(len(recruit_counts_bar)))
ax12.set_xticklabels(recruit_counts_bar.index, rotation=45, ha='right')
ax12.set_ylabel('Number of Hires', fontsize=12)
ax12.set_title('Top Recruitment Sources (Bar)', fontsize=14, fontweight='bold')
ax12.grid(axis='y', alpha=0.3)
# Add value labels
for i, (idx, val) in enumerate(recruit_counts_bar.items()):
    ax12.text(i, val, str(val), ha='center', va='bottom', fontsize=9)

plt.tight_layout()
plt.savefig('business_metrics_part1.png', dpi=300, bbox_inches='tight')
print("Part 1 saved: business_metrics_part1.png")

# ==================== SCATTER PLOTS ====================

fig2 = plt.figure(figsize=(20, 16))

# 13. Salary vs Performance Score (Scatter Plot)
ax13 = plt.subplot(3, 3, 1)
# Map performance scores to numeric values for better visualization
perf_map = {'PIP': 1, 'Needs Improvement': 2, 'Fully Meets': 3, 'Exceeds': 4}
df['PerfScoreNumeric'] = df['PerformanceScore'].map(perf_map)
scatter = ax13.scatter(df['PerfScoreNumeric'], df['Salary'], 
                       c=df['EmpSatisfaction'], cmap='viridis', 
                       alpha=0.6, s=50, edgecolors='black', linewidth=0.5)
ax13.set_xlabel('Performance Score', fontsize=12)
ax13.set_ylabel('Salary ($)', fontsize=12)
ax13.set_xticks([1, 2, 3, 4])
ax13.set_xticklabels(['PIP', 'Needs\nImprovement', 'Fully\nMeets', 'Exceeds'])
ax13.set_title('Salary vs Performance Score\n(Color = Employee Satisfaction)', 
               fontsize=14, fontweight='bold')
ax13.grid(alpha=0.3)
plt.colorbar(scatter, ax=ax13, label='Employee Satisfaction')

# 14. Salary vs Engagement Survey (Scatter Plot)
ax14 = plt.subplot(3, 3, 2)
scatter2 = ax14.scatter(df['EngagementSurvey'], df['Salary'],
                        c=df['EmpSatisfaction'], cmap='plasma',
                        alpha=0.6, s=50, edgecolors='black', linewidth=0.5)
ax14.set_xlabel('Engagement Survey Score', fontsize=12)
ax14.set_ylabel('Salary ($)', fontsize=12)
ax14.set_title('Salary vs Engagement Survey\n(Color = Employee Satisfaction)',
               fontsize=14, fontweight='bold')
ax14.grid(alpha=0.3)
plt.colorbar(scatter2, ax=ax14, label='Employee Satisfaction')

# 15. Salary vs Employee Satisfaction (Scatter Plot)
ax15 = plt.subplot(3, 3, 3)
scatter3 = ax15.scatter(df['EmpSatisfaction'], df['Salary'],
                        c=df['EngagementSurvey'], cmap='coolwarm',
                        alpha=0.6, s=50, edgecolors='black', linewidth=0.5)
ax15.set_xlabel('Employee Satisfaction', fontsize=12)
ax15.set_ylabel('Salary ($)', fontsize=12)
ax15.set_title('Salary vs Employee Satisfaction\n(Color = Engagement Survey)',
               fontsize=14, fontweight='bold')
ax15.grid(alpha=0.3)
plt.colorbar(scatter3, ax=ax15, label='Engagement Survey')

# 16. Engagement Survey vs Employee Satisfaction (Scatter Plot)
ax16 = plt.subplot(3, 3, 4)
scatter4 = ax16.scatter(df['EmpSatisfaction'], df['EngagementSurvey'],
                        c=df['Salary'], cmap='YlOrRd',
                        alpha=0.6, s=50, edgecolors='black', linewidth=0.5)
ax16.set_xlabel('Employee Satisfaction', fontsize=12)
ax16.set_ylabel('Engagement Survey Score', fontsize=12)
ax16.set_title('Engagement Survey vs Employee Satisfaction\n(Color = Salary)',
               fontsize=14, fontweight='bold')
ax16.grid(alpha=0.3)
plt.colorbar(scatter4, ax=ax16, label='Salary ($)')

# 17. Absences vs Days Late Last 30 (Scatter Plot)
ax17 = plt.subplot(3, 3, 5)
scatter5 = ax17.scatter(df['DaysLateLast30'], df['Absences'],
                        c=df['EmpSatisfaction'], cmap='RdYlGn_r',
                        alpha=0.6, s=50, edgecolors='black', linewidth=0.5)
ax17.set_xlabel('Days Late (Last 30 Days)', fontsize=12)
ax17.set_ylabel('Absences', fontsize=12)
ax17.set_title('Absences vs Days Late\n(Color = Employee Satisfaction)',
               fontsize=14, fontweight='bold')
ax17.grid(alpha=0.3)
plt.colorbar(scatter5, ax=ax17, label='Employee Satisfaction')

# 18. Salary vs Absences (Scatter Plot)
ax18 = plt.subplot(3, 3, 6)
scatter6 = ax18.scatter(df['Absences'], df['Salary'],
                        c=df['PerfScoreNumeric'], cmap='RdYlGn',
                        alpha=0.6, s=50, edgecolors='black', linewidth=0.5)
ax18.set_xlabel('Absences', fontsize=12)
ax18.set_ylabel('Salary ($)', fontsize=12)
ax18.set_title('Salary vs Absences\n(Color = Performance Score)',
               fontsize=14, fontweight='bold')
ax18.grid(alpha=0.3)
cbar = plt.colorbar(scatter6, ax=ax18)
cbar.set_label('Performance Score')
cbar.set_ticks([1, 2, 3, 4])
cbar.set_ticklabels(['PIP', 'Needs\nImprovement', 'Fully\nMeets', 'Exceeds'])

# 19. Engagement Survey vs Performance Score (Scatter Plot)
ax19 = plt.subplot(3, 3, 7)
scatter7 = ax19.scatter(df['PerfScoreNumeric'], df['EngagementSurvey'],
                        c=df['Salary'], cmap='viridis',
                        alpha=0.6, s=50, edgecolors='black', linewidth=0.5)
ax19.set_xlabel('Performance Score', fontsize=12)
ax19.set_ylabel('Engagement Survey Score', fontsize=12)
ax19.set_xticks([1, 2, 3, 4])
ax19.set_xticklabels(['PIP', 'Needs\nImprovement', 'Fully\nMeets', 'Exceeds'])
ax19.set_title('Engagement Survey vs Performance Score\n(Color = Salary)',
               fontsize=14, fontweight='bold')
ax19.grid(alpha=0.3)
plt.colorbar(scatter7, ax=ax19, label='Salary ($)')

# 20. Employee Satisfaction vs Performance Score (Scatter Plot)
ax20 = plt.subplot(3, 3, 8)
scatter8 = ax20.scatter(df['PerfScoreNumeric'], df['EmpSatisfaction'],
                        c=df['Salary'], cmap='plasma',
                        alpha=0.6, s=50, edgecolors='black', linewidth=0.5)
ax20.set_xlabel('Performance Score', fontsize=12)
ax20.set_ylabel('Employee Satisfaction', fontsize=12)
ax20.set_xticks([1, 2, 3, 4])
ax20.set_xticklabels(['PIP', 'Needs\nImprovement', 'Fully\nMeets', 'Exceeds'])
ax20.set_title('Employee Satisfaction vs Performance Score\n(Color = Salary)',
               fontsize=14, fontweight='bold')
ax20.grid(alpha=0.3)
plt.colorbar(scatter8, ax=ax20, label='Salary ($)')

# 21. Special Projects Count vs Salary (Scatter Plot)
ax21 = plt.subplot(3, 3, 9)
scatter9 = ax21.scatter(df['SpecialProjectsCount'], df['Salary'],
                        c=df['PerfScoreNumeric'], cmap='coolwarm',
                        alpha=0.6, s=50, edgecolors='black', linewidth=0.5)
ax21.set_xlabel('Special Projects Count', fontsize=12)
ax21.set_ylabel('Salary ($)', fontsize=12)
ax21.set_title('Special Projects Count vs Salary\n(Color = Performance Score)',
               fontsize=14, fontweight='bold')
ax21.grid(alpha=0.3)
cbar2 = plt.colorbar(scatter9, ax=ax21)
cbar2.set_label('Performance Score')
cbar2.set_ticks([1, 2, 3, 4])
cbar2.set_ticklabels(['PIP', 'Needs\nImprovement', 'Fully\nMeets', 'Exceeds'])

plt.tight_layout()
plt.savefig('business_metrics_part2.png', dpi=300, bbox_inches='tight')
print("Part 2 saved: business_metrics_part2.png")

# Print summary statistics
print("\n" + "="*60)
print("SUMMARY STATISTICS")
print("="*60)
print(f"\nTotal Employees: {len(df)}")
print(f"Active Employees: {len(df[df['EmploymentStatus'] == 'Active'])}")
print(f"Terminated Employees: {len(df[df['Termd'] == 1])}")
print(f"\nAverage Salary: ${df['Salary'].mean():,.2f}")
print(f"Median Salary: ${df['Salary'].median():,.2f}")
print(f"\nAverage Engagement Survey: {df['EngagementSurvey'].mean():.2f}")
print(f"Average Employee Satisfaction: {df['EmpSatisfaction'].mean():.2f}")
print(f"\nAverage Absences: {df['Absences'].mean():.2f}")
print(f"Average Days Late (Last 30): {df['DaysLateLast30'].mean():.2f}")

print("\n" + "="*60)
print("Visualizations saved successfully!")
print("="*60)
print("Files created:")
print("  - business_metrics_part1.png (Pie charts and bar graphs)")
print("  - business_metrics_part2.png (Scatter plots)")

