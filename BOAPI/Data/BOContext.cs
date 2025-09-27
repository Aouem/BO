using Microsoft.EntityFrameworkCore;
using BOAPI.Models;

namespace BOAPI.Data
{
    public class BOContext : DbContext
    {
        public BOContext(DbContextOptions<BOContext> options) : base(options) { }

        public DbSet<CheckList> CheckLists { get; set; }
        public DbSet<Etape> Etapes { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<ResponseOption> ResponseOptions { get; set; }
        public DbSet<Personnel> Personnels { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // CheckList → Etapes
            modelBuilder.Entity<CheckList>()
                        .HasMany(c => c.Etapes)
                        .WithOne(e => e.CheckList)
                        .HasForeignKey(e => e.CheckListId)
                        .OnDelete(DeleteBehavior.Cascade);

            // Etape → Questions
            modelBuilder.Entity<Etape>()
                        .HasMany(e => e.Questions)
                        .WithOne(q => q.Etape)
                        .HasForeignKey(q => q.EtapeId)
                        .OnDelete(DeleteBehavior.Cascade);

            // Question → ResponseOptions
            modelBuilder.Entity<Question>()
                        .HasMany(q => q.Options)
                        .WithOne(o => o.Question)
                        .HasForeignKey(o => o.QuestionId)
                        .OnDelete(DeleteBehavior.Cascade);

            // Personnel → traçabilité optionnelle
            modelBuilder.Entity<Personnel>()
                        .HasKey(p => p.Id);
        }
    }
}
