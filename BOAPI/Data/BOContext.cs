using Microsoft.EntityFrameworkCore;
using BOAPI.Models;

namespace BOAPI.Data
{
    public class BOContext : DbContext
    {
        public BOContext(DbContextOptions<BOContext> options) : base(options) { }

        public DbSet<CheckList> CheckLists { get; set; }
        public DbSet<Question> Questions { get; set; }
        public DbSet<ResponseOption> ResponseOptions { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Relations optionnelles
            modelBuilder.Entity<Question>()
                        .HasMany(q => q.Options)
                        .WithOne(o => o.Question)
                        .HasForeignKey(o => o.QuestionId)
                        .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<CheckList>()
                        .HasMany(c => c.Questions)
                        .WithOne(q => q.CheckList)
                        .HasForeignKey(q => q.CheckListId)
                        .OnDelete(DeleteBehavior.Cascade);
        }
    }
}
