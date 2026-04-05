using System;
using System.IO;
using System.Threading.Tasks;
using ERP.Entities.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using QuestPDF.Previewer;

namespace ERP.Services.Common
{
    public class PdfService : IPdfService
    {
        static PdfService()
        {
            // QuestPDF License setup
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public Task<byte[]> GenerateContractPdfAsync(Entities.Models.Contracts contract)
        {
            if (contract == null) throw new ArgumentNullException(nameof(contract));

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(12).FontFamily(Fonts.Verdana));

                    page.Header().Text("HỢP ĐỒNG LAO ĐỘNG").SemiBold().FontSize(20).FontColor(Colors.Blue.Medium).AlignCenter();

                    page.Content().PaddingVertical(1, Unit.Centimetre).Column(col =>
                    {
                        var content = contract.Template?.content ?? "Nội dung hợp đồng chưa được thiết lập.";
                        
                        // Replace placeholders
                        content = ReplacePlaceholders(content, contract);

                        col.Item().Text(content).Justify();
                        
                        col.Item().PaddingTop(2, Unit.Centimetre).Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("ĐẠI DIỆN CÔNG TY").SemiBold().AlignCenter();
                                c.Item().PaddingTop(1, Unit.Centimetre).Text("(Ký và ghi rõ họ tên)").Italic().AlignCenter();
                            });

                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text("NGƯỜI LAO ĐỘNG").SemiBold().AlignCenter();
                                c.Item().PaddingTop(1, Unit.Centimetre).Text(contract.Employee?.full_name ?? "....................").AlignCenter();
                            });
                        });
                    });

                    page.Footer().AlignCenter().Text(x =>
                    {
                        x.Span("Trang ");
                        x.CurrentPageNumber();
                    });
                });
            });

            using (var ms = new MemoryStream())
            {
                document.GeneratePdf(ms);
                return Task.FromResult(ms.ToArray());
            }
        }

        private string ReplacePlaceholders(string template, Entities.Models.Contracts contract)
        {
            if (string.IsNullOrEmpty(template)) return "";

            return template
                .Replace("{{FullName}}", contract.Employee?.full_name ?? "....................")
                .Replace("{{EmployeeCode}}", contract.Employee?.employee_code ?? "....................")
                .Replace("{{ContractNumber}}", contract.contract_number ?? "....................")
                .Replace("{{EffectiveDate}}", contract.effective_date?.ToString("dd/MM/yyyy") ?? "....................")
                .Replace("{{ExpiryDate}}", contract.expiry_date?.ToString("dd/MM/yyyy") ?? "Không xác định")
                .Replace("{{SignDate}}", contract.sign_date?.ToString("dd/MM/yyyy") ?? DateTime.Now.ToString("dd/MM/yyyy"))
                .Replace("{{Department}}", contract.Employee?.Department?.name ?? "....................")
                .Replace("{{JobTitle}}", contract.Employee?.JobTitle?.name ?? "....................");
        }
    }
}
