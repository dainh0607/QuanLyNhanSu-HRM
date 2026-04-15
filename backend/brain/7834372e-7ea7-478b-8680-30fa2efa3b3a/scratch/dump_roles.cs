using ERP.Entities;
using Microsoft.EntityFrameworkCore;
using System;
using System.Linq;

namespace ERP.Scratch
{
    public class RoleDumper
    {
        public static void Dump(AppDbContext context)
        {
            var roles = context.Roles.ToList();
            Console.WriteLine("--- Roles ---");
            foreach (var r in roles)
            {
                Console.WriteLine($"ID: {r.Id}, Name: {r.name}");
            }
            Console.WriteLine("-------------");
        }
    }
}
