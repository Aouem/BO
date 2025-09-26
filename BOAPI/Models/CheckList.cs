namespace BOAPI.Models;

public class CheckList
{
    public int Id { get; set; }
    public string Libelle { get; set; } = string.Empty;

    public ICollection<Question> Questions { get; set; } = new List<Question>();
}
