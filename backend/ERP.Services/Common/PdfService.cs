using System;
using System.IO;
using System.Threading.Tasks;
using ERP.Entities.Models;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using QuestPDF.Previewer;
using iText.Kernel.Pdf;
using iText.Kernel.Pdf.Canvas;
using iText.IO.Image;

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
                    page.DefaultTextStyle(x => x.FontSize(12).FontFamily(Fonts.Tahoma));

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

        public Task<byte[]> GeneratePdfFromTextAsync(string text, string title)
        {
            if (string.IsNullOrEmpty(text)) text = "(Không có nội dung văn bản)";

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(1, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(11).FontFamily(Fonts.Verdana));

                    page.Header().Text(title).SemiBold().FontSize(14).AlignCenter();

                    page.Content().PaddingVertical(0.5f, Unit.Centimetre).Column(col =>
                    {
                        // Split by new lines to handle basic paragraph spacing
                        var paragraphs = text.Split(new[] { "\n", "\r\n" }, StringSplitOptions.None);
                        foreach (var p in paragraphs)
                        {
                            if (string.IsNullOrWhiteSpace(p))
                            {
                                col.Item().PaddingBottom(5);
                            }
                            else
                            {
                                col.Item().Text(p).Justify();
                            }
                        }
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
        public async Task<byte[]> StampSignatureAsync(
            byte[] pdfBytes,
            byte[] signatureImageBytes,
            int pageNumber,
            float xCoordinate,
            float yCoordinate,
            float? width = null,
            float? height = null)
        {
            try
            {
                // Validate inputs
                if (pdfBytes == null || pdfBytes.Length == 0)
                    throw new ArgumentException("PDF bytes cannot be empty", nameof(pdfBytes));
                
                if (signatureImageBytes == null || signatureImageBytes.Length == 0)
                    throw new ArgumentException("Signature image bytes cannot be empty", nameof(signatureImageBytes));

                if (pageNumber < 1)
                    throw new ArgumentException("Page number must be greater than 0", nameof(pageNumber));

                // Read PDF and add signature
                using (var inputStream = new MemoryStream(pdfBytes))
                using (var outputStream = new MemoryStream())
                {
                    // Open PDF for reading and writing
                    PdfReader reader = new PdfReader(inputStream);
                    PdfWriter writer = new PdfWriter(outputStream);
                    PdfDocument pdfDoc = new PdfDocument(reader, writer);

                    // Check if page exists
                    if (pageNumber > pdfDoc.GetNumberOfPages())
                        throw new ArgumentException($"Page {pageNumber} does not exist in PDF", nameof(pageNumber));

                    // Get the specified page
                    PdfPage page = pdfDoc.GetPage(pageNumber);
                    
                    // Create image from signature bytes
                    ImageData imageData = ImageDataFactory.Create(signatureImageBytes);
                    iText.Layout.Element.Image signatureImage = new iText.Layout.Element.Image(imageData);

                    var pageSize = page.GetPageSize();
                    var useNormalizedCoordinates =
                        xCoordinate >= 0 && xCoordinate <= 1 &&
                        yCoordinate >= 0 && yCoordinate <= 1 &&
                        (!width.HasValue || (width.Value >= 0 && width.Value <= 1)) &&
                        (!height.HasValue || (height.Value >= 0 && height.Value <= 1));

                    // Set dimensions
                    float imageWidth = useNormalizedCoordinates
                        ? (width ?? 0.24f) * pageSize.GetWidth()
                        : width ?? 100;
                    float imageHeight = useNormalizedCoordinates
                        ? (height ?? 0.08f) * pageSize.GetHeight()
                        : height ?? 50;

                    // If only width is provided, scale height proportionally
                    if (width.HasValue && !height.HasValue)
                    {
                        float aspectRatio = imageData.GetHeight() / imageData.GetWidth();
                        imageHeight = imageWidth * aspectRatio;
                    }
                    // If only height is provided, scale width proportionally
                    else if (height.HasValue && !width.HasValue)
                    {
                        float aspectRatio = imageData.GetWidth() / imageData.GetHeight();
                        imageWidth = imageHeight * aspectRatio;
                    }

                    signatureImage.SetWidth(imageWidth);
                    signatureImage.SetHeight(imageHeight);

                    // Create layout document for adding the image
                    using iText.Layout.Document document = new iText.Layout.Document(pdfDoc, 
                        new iText.Kernel.Geom.PageSize(page.GetPageSize().GetWidth(), page.GetPageSize().GetHeight()));

                    // Support both PDF points (bottom-left origin) and normalized UI coordinates (top-left origin).
                    float finalX = useNormalizedCoordinates
                        ? xCoordinate * pageSize.GetWidth()
                        : xCoordinate;
                    float finalY = useNormalizedCoordinates
                        ? pageSize.GetHeight() - (yCoordinate * pageSize.GetHeight()) - imageHeight
                        : yCoordinate;

                    signatureImage.SetFixedPosition(pageNumber, finalX, finalY, imageWidth);
                    document.Add(signatureImage);

                    document.Close();
                    pdfDoc.Close();

                    return await Task.FromResult(outputStream.ToArray());
                }
            }
            catch (Exception ex)
            {
                throw new Exception($"Error stamping signature on PDF: {ex.Message}", ex);
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
