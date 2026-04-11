using System.IO;
using System.Threading.Tasks;
using Mammoth;

namespace ERP.Services.Common
{
    public class DocxService : IDocxService
    {
        public async Task<string> ExtractTextAsync(Stream docxStream)
        {
            var converter = new DocumentConverter();
            // We use ExtractRawText for maximum simplicity and stability with QuestPDF
            var result = await Task.Run(() => converter.ExtractRawText(docxStream));
            
            foreach (var warning in result.Warnings)
            {
                // Log warnings if needed, here we just continue
            }

            return result.Value;
        }
    }
}
