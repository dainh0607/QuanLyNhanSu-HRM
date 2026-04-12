using System.IO;
using System.Threading.Tasks;

namespace ERP.Services.Common
{
    public interface IDocxService
    {
        Task<string> ExtractTextAsync(Stream docxStream);
    }
}
