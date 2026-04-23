using System;
using System.IO;
using System.Text;

class Program
{
    static void Main()
    {
        string path = @"e:\NexaHR_2026\QuanLyNhanSu-HRM\backend\ERP.API\DataTest\sample_data.sql";
        string content = File.ReadAllText(path, Encoding.UTF8);
        
        // Find a line containing the broken string
        int index = content.IndexOf("káº¿t hĂ´n");
        if (index != -1)
        {
            string sub = content.Substring(Math.Max(0, index - 10), 30);
            Console.WriteLine("Snippet: " + sub);
            foreach (char c in sub)
            {
                Console.WriteLine($"Char: {c} - Hex: {(int)c:X4}");
            }
        }
    }
}
