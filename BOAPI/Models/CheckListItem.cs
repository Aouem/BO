using System;
using System.ComponentModel.DataAnnotations;

namespace BOAPI.Models
{
    public class CheckListItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        public string? Description { get; set; }

        public bool IsChecked { get; set; } = false;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public string? CheckedBy { get; set; } // utilisateur qui a validé
    }
}
