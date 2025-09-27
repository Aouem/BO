namespace BOAPI.Models;

public class CheckList
{
  public int Id { get; set; }
    public string Libelle { get; set; } = string.Empty;

    // Etapes de la checklist (Pré-op, Induction, Post-op)
    public ICollection<Etape> Etapes { get; set; } = new List<Etape>();

    public DateTime DateCreation { get; set; } = DateTime.UtcNow;
}
