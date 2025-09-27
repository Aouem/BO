
namespace BOAPI.Models;


public class Etape
{
    public int Id { get; set; }
    public string Nom { get; set; } = string.Empty; // Ex: Pré-op, Induction, Post-op

    // Checklist parente
    public int CheckListId { get; set; }
    public CheckList? CheckList { get; set; }

    // Questions de cette étape
    public ICollection<Question> Questions { get; set; } = new List<Question>();

    // Validation de l'étape
    public bool EstValidee { get; set; } = false;
    public int? ValideeParId { get; set; } // ID du personnel
    public DateTime? DateValidation { get; set; }
}
