using ERP.Entities;
using Microsoft.EntityFrameworkCore;

namespace ERP.API.Auth
{
    public static class AuthSessionSchemaInitializer
    {
        public static Task EnsureCreatedAsync(AppDbContext context)
        {
            const string sql = """
                IF OBJECT_ID(N'[dbo].[AuthSessions]', N'U') IS NULL
                BEGIN
                    CREATE TABLE [dbo].[AuthSessions]
                    (
                        [id] INT IDENTITY(1,1) NOT NULL PRIMARY KEY,
                        [user_id] INT NOT NULL,
                        [session_id] NVARCHAR(64) NOT NULL,
                        [refresh_token_hash] NVARCHAR(128) NOT NULL,
                        [csrf_token_hash] NVARCHAR(128) NOT NULL,
                        [expires_at] DATETIME2 NOT NULL,
                        [last_used_at] DATETIME2 NULL,
                        [revoked_at] DATETIME2 NULL,
                        [replaced_by_session_id] NVARCHAR(64) NULL,
                        [ip_address] NVARCHAR(128) NULL,
                        [user_agent] NVARCHAR(512) NULL,
                        [is_active] BIT NOT NULL CONSTRAINT [DF_AuthSessions_is_active] DEFAULT 1,
                        [created_at] DATETIME2 NOT NULL,
                        [updated_at] DATETIME2 NULL,
                        CONSTRAINT [FK_AuthSessions_Users_user_id] FOREIGN KEY ([user_id]) REFERENCES [Users]([id]) ON DELETE NO ACTION
                    );

                    CREATE UNIQUE INDEX [IX_AuthSessions_session_id] ON [dbo].[AuthSessions]([session_id]);
                    CREATE UNIQUE INDEX [IX_AuthSessions_refresh_token_hash] ON [dbo].[AuthSessions]([refresh_token_hash]);
                    CREATE INDEX [IX_AuthSessions_user_id_is_active] ON [dbo].[AuthSessions]([user_id], [is_active]);
                END
                """;

            return context.Database.ExecuteSqlRawAsync(sql);
        }
    }
}
