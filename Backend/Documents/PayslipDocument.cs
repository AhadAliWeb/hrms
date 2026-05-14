using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using Backend.DTOs;
using System.Globalization;

namespace Backend.Documents
{
    public class PayslipDocument : IDocument
    {
        private readonly PayslipResponseDto _payslip;
        private readonly CultureInfo _culture = new CultureInfo("en-US");

        // Color Palette
        private readonly string PrimaryDark = "#1a1a2e";
        private readonly string PrimaryBlue = "#16213e";
        private readonly string AccentBlue = "#0f3460";
        private readonly string Gold = "#e94560";
        private readonly string LightGray = "#f8f9fa";
        private readonly string MidGray = "#e9ecef";
        private readonly string TextGray = "#6c757d";
        private readonly string White = "#ffffff";
        private readonly string Red = "#dc3545";
        private readonly string Yellow = "#ffc107";
        private readonly string Green = "#198754";

        public PayslipDocument(PayslipResponseDto payslip) => _payslip = payslip;

        public DocumentMetadata GetMetadata() => DocumentMetadata.Default;

        private string MonthName => new DateTime(_payslip.Year, _payslip.Month, 1).ToString("MMMM");

        public void Compose(IDocumentContainer container)
        {
            container.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(0);
                page.DefaultTextStyle(x => x.FontFamily("Arial").FontSize(10).FontColor(PrimaryDark));

                page.Content().Column(col =>
                {
                    // ── Header ──────────────────────────────────────────
                    col.Item().Background(PrimaryDark).Padding(40).Row(row =>
                    {
                        row.RelativeItem().Column(c =>
                        {
                            c.Item().Text("PAYSLIP")
                                .FontSize(32).Bold().FontColor(White).LetterSpacing(0.1f);
                            c.Item().Text($"{MonthName} {_payslip.Year}")
                                .FontSize(13).FontColor("#a0aec0");
                        });

                        row.ConstantItem(2).Background("#e94560");

                        row.ConstantItem(200).PaddingLeft(24).Column(c =>
                        {
                            c.Item().Text(_payslip.EmployeeName)
                                .FontSize(16).Bold().FontColor(White);
                            c.Item().PaddingTop(4).Text(_payslip.Designation)
                                .FontSize(11).FontColor("#a0aec0");
                            c.Item().PaddingTop(2).Text(_payslip.Department)
                                .FontSize(11).FontColor("#a0aec0");
                        });
                    });

                    // ── Summary Cards ────────────────────────────────────
                    col.Item().Background(AccentBlue).PaddingHorizontal(40).PaddingVertical(20).Row(row =>
                    {
                        SummaryCard(row, "Basic Salary", _payslip.BasicSalary, White);
                        CardDivider(row);
                        SummaryCard(row, "Total Earnings", _payslip.BasicSalary + _payslip.Allowances + _payslip.ApprovedOvertimeAmount, "#90cdf4");
                        CardDivider(row);
                        SummaryCard(row, "Deductions", _payslip.Deductions, "#fc8181");
                        CardDivider(row);
                        SummaryCard(row, "Net Salary", _payslip.NetSalary, "#68d391");
                    });

                    // ── Body ─────────────────────────────────────────────
                    col.Item().Padding(40).Column(body =>
                    {
                        body.Item().Row(row =>
                        {
                            // Earnings
                            row.RelativeItem().Column(section =>
                            {
                                SectionHeader(section, "EARNINGS");
                                EarningsRow(section, "Basic Salary", _payslip.BasicSalary, false);
                                EarningsRow(section, "Allowances", _payslip.Allowances, false);
                                EarningsRow(section, "Approved Overtime", _payslip.ApprovedOvertimeAmount, false);
                                EarningsRow(section, "Pending Overtime", _payslip.PendingOvertimeAmount, false, isPending: true);
                            });

                            row.ConstantItem(30);

                            // Deductions
                            row.RelativeItem().Column(section =>
                            {
                                SectionHeader(section, "DEDUCTIONS");
                                EarningsRow(section, "Total Deductions", _payslip.Deductions, false, isDeduction: true);
                            });
                        });

                        // ── Net Salary Bar ───────────────────────────────
                        body.Item().PaddingTop(30).Background(LightGray).Border(1).BorderColor(MidGray)
                            .Padding(20).Row(row =>
                        {
                            row.RelativeItem().Text("NET SALARY PAYABLE")
                                .FontSize(13).Bold().FontColor(PrimaryDark);
                            row.AutoItem().Text(_payslip.NetSalary.ToString("C", _culture))
                                .FontSize(18).Bold().FontColor(Green);
                        });

                        // ── Footer Note ──────────────────────────────────
                        body.Item().PaddingTop(30).BorderTop(1).BorderColor(MidGray).PaddingTop(16)
                            .Text("This is a system-generated payslip and does not require a signature.")
                            .FontSize(9).FontColor(TextGray).Italic().AlignCenter();

                        body.Item().PaddingTop(6)
                            .Text($"Generated on {DateTime.Now:dd MMM yyyy, hh:mm tt}")
                            .FontSize(9).FontColor(TextGray).AlignCenter();
                    });
                });
            });
        }

        private void SummaryCard(RowDescriptor row, string label, decimal value, string valueColor)
        {
            row.RelativeItem().AlignCenter().Column(c =>
            {
                c.Item().Text(value.ToString("C", _culture))
                    .FontSize(15).Bold().FontColor(valueColor).AlignCenter();
                c.Item().PaddingTop(4).Text(label)
                    .FontSize(9).FontColor("#90cdf4").AlignCenter();
            });
        }

        private void CardDivider(RowDescriptor row)
        {
            row.ConstantItem(1).Background("#ffffff33");
        }

        private void SectionHeader(ColumnDescriptor col, string title)
        {
            col.Item()
                .Background(PrimaryDark)
                .Padding(10)
                .Text(title)
                .FontSize(10).Bold().FontColor(White).LetterSpacing(0.1f);

            col.Item().Height(2).Background(Gold);
        }

        private void EarningsRow(ColumnDescriptor col, string label, decimal amount, bool isLast,
            bool isDeduction = false, bool isPending = false)
        {
            var bgColor = isLast ? MidGray : White;
            var amountColor = isDeduction ? Red : isPending ? Yellow : PrimaryDark;

            col.Item().Background(bgColor)
                .BorderBottom(1).BorderColor(MidGray)
                .PaddingHorizontal(10).PaddingVertical(10)
                .Row(row =>
                {
                    row.RelativeItem().Text(label).FontSize(10).FontColor(TextGray);
                    row.AutoItem().Text(amount.ToString("C", _culture))
                        .FontSize(10).Bold().FontColor(amountColor);
                });
        }
    }
}