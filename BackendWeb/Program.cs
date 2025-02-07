using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins",
        builder =>
        {
            builder.AllowAnyOrigin()
                   .AllowAnyMethod()
                   .AllowAnyHeader();
        });
});

// Configure Entity Framework with SQLite
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlite("Data Source=game.db")
);

var app = builder.Build();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    db.Database.Migrate();  // This ensures the latest migration is applied
    DatabaseSeeder.SeedData(db);
}


app.UseCors("AllowAllOrigins");
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.MapGet("/init", async (ApplicationDbContext db) =>
{
    var sampleData = new List<UserProfile>
    {
        new UserProfile { PlayerName = "Player1", HighScore = 100 },
        new UserProfile { PlayerName = "Player2", HighScore = 200 },
    };

    db.UserProfiles.AddRange(sampleData);
    await db.SaveChangesAsync();

    return Results.Ok(new { message = "Database initialized with sample data!" });
});

app.MapGet("/", () => "Welcome to the Hill Climb Racing");

// Register player's name
app.MapPost("/players", async (ApplicationDbContext db, PlayerNameRequest request) =>
{
    if (string.IsNullOrEmpty(request.PlayerName))
    {
        return Results.BadRequest("Player name is required");
    }

    var existingUser = await db.UserProfiles.FirstOrDefaultAsync(u => u.PlayerName == request.PlayerName);

    if (existingUser != null)
    {
        return Results.BadRequest("Player name already exists");
    }

    var newUser = new UserProfile
    {
        PlayerName = request.PlayerName,
        HighScore = 0
    };

    db.UserProfiles.Add(newUser);
    await db.SaveChangesAsync();

    return Results.Ok(new { message = "New player registered successfully" });
});

// Endpoint to submit a player's score
app.MapPost("/submit-score", async (ApplicationDbContext db, PlayerScore score) =>
{
    if (string.IsNullOrEmpty(score.PlayerName) || score.Score < 0)
    {
        return Results.BadRequest("Invalid score data.");
    }

    var userProfile = await db.UserProfiles
        .FirstOrDefaultAsync(u => u.PlayerName == score.PlayerName);
    if (userProfile == null)
    {
        userProfile = new UserProfile
        {
            PlayerName = score.PlayerName,
            HighScore = score.Score
        };
        db.UserProfiles.Add(userProfile);
    }
    else
    {
        if (score.Score > userProfile.HighScore)
        {
            userProfile.HighScore = score.Score;
        }
    }

    await db.SaveChangesAsync();
    return Results.Ok(new { message = "Score submitted successfully!" });
});

app.MapGet("/get-highscore", async (ApplicationDbContext db, string playerName) =>
{
    var userProfile = await db.UserProfiles
        .FirstOrDefaultAsync(u => u.PlayerName == playerName);

    if (userProfile == null)
    {
        return Results.NotFound(new { message = "Player not found." });
    }

    return Results.Ok(new { playerName = userProfile.PlayerName, highScore = userProfile.HighScore });
});

// Endpoint to get all player names
app.MapGet("/playerlist", async (ApplicationDbContext db) =>
{
    var players = await db.UserProfiles
                          .Select(u => u.PlayerName)
                          .ToListAsync();

    return Results.Ok(players);
});

// Endpoint to get the leaderboard (top 20 scores)
app.MapGet("/leaderboard", async (ApplicationDbContext db) =>
{
    var leaderboard = await db.UserProfiles
        .OrderByDescending(u => u.HighScore)
        .Take(20)
        .ToListAsync();

    return Results.Ok(leaderboard);
});

app.Run();
public record PlayerScore
{
    public string PlayerName { get; set; }
    public int Score { get; set; }
}

public record PlayerNameRequest
{
    public string PlayerName { get; set; }
}

public class UserProfile
{
    public int Id { get; set; }
    public string PlayerName { get; set; }
    public int HighScore { get; set; }
}

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    { }

    public DbSet<UserProfile> UserProfiles { get; set; }
}

public static class DatabaseSeeder
{
    public static void SeedData(ApplicationDbContext db)
    {
        // Check if the UserProfiles table is empty
        if (!db.UserProfiles.Any())
        {
            db.UserProfiles.AddRange(
                new UserProfile { PlayerName = "TestPlayer1", HighScore = 50 },
                new UserProfile { PlayerName = "TestPlayer2", HighScore = 150 }
            );
            db.SaveChanges();
        }
    }
}


