namespace BOAPI.Models;

public class Question
{
    public int Id { get; set; }
    public string Texte { get; set; } = string.Empty;
    public QuestionType Type { get; set; }

    public ICollection<ResponseOption> Options { get; set; } = new List<ResponseOption>();

    // Association à l'étape
    public int EtapeId { get; set; }
    public Etape? Etape { get; set; }

    // Réponse saisie
    public string? Reponse { get; set; } // Oui / Non / N/A / Texte / Liste
    public int? ValideeParId { get; set; } // ID du personnel qui a validé
    public DateTime? DateValidation { get; set; }
}

public enum QuestionType
{
      Boolean = 0,
    Liste = 1,
    Texte = 2,
    NA = 3 // option N/A
}
