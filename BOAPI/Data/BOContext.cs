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
        public DbSet<CheckListItem> CheckListItems { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configuration des relations
            modelBuilder.Entity<CheckList>()
                .HasMany(c => c.Etapes)
                .WithOne(e => e.CheckList)
                .HasForeignKey(e => e.CheckListId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Etape>()
                .HasMany(e => e.Questions)
                .WithOne(q => q.Etape)
                .HasForeignKey(q => q.EtapeId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Question>()
                .HasMany(q => q.Options)
                .WithOne(o => o.Question)
                .HasForeignKey(o => o.QuestionId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<Personnel>()
                .HasMany(p => p.EtapesValidees)
                .WithOne(e => e.ValideePar)
                .HasForeignKey(e => e.ValideeParId)
                .OnDelete(DeleteBehavior.Restrict);

            modelBuilder.Entity<Personnel>()
                .HasMany(p => p.QuestionsValidees)
                .WithOne(q => q.ValideePar)
                .HasForeignKey(q => q.ValideeParId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configuration des enums
            modelBuilder.Entity<Question>()
                .Property(q => q.Type)
                .HasConversion<string>();

            // Index pour améliorer les performances
            modelBuilder.Entity<CheckList>()
                .HasIndex(c => c.EstActive);

            modelBuilder.Entity<Etape>()
                .HasIndex(e => new { e.CheckListId, e.Ordre });

            modelBuilder.Entity<Personnel>()
                .HasIndex(p => p.Matricule)
                .IsUnique();

            // Configuration pour CheckListItem si utilisé
            modelBuilder.Entity<CheckListItem>()
                .HasOne(cli => cli.Question)
                .WithMany()
                .HasForeignKey(cli => cli.QuestionId)
                .OnDelete(DeleteBehavior.SetNull);
        }
    }
}