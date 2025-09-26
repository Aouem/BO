namespace BOAPI.Models;

public class Question
{
    public int Id { get; set; }
    public string Texte { get; set; } = string.Empty;

    public QuestionType Type { get; set; }

    public ICollection<ResponseOption> Options { get; set; } = new List<ResponseOption>();

    public int CheckListId { get; set; }
    public CheckList? CheckList { get; set; }
}

public enum QuestionType
{
    Boolean = 0,
    Liste = 1,
    Texte = 2
}
