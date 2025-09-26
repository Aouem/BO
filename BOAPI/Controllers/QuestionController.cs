using BOAPI.Data;
using BOAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BOAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class QuestionController : ControllerBase
    {
        private readonly BOContext _context;

        public QuestionController(BOContext context)
        {
            _context = context;
        }

        // GET: api/Question
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Question>>> GetAll()
        {
            return await _context.Questions
                                 .Include(q => q.Options) // Inclure les options
                                 .ToListAsync();
        }

        // GET: api/Question/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Question>> GetById(int id)
        {
            var question = await _context.Questions
                                         .Include(q => q.Options)
                                         .FirstOrDefaultAsync(q => q.Id == id);
            if (question == null) return NotFound();
            return question;
        }

        // POST: api/Question
        [HttpPost]
        public async Task<ActionResult<Question>> Create(Question question)
        {
            _context.Questions.Add(question);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { id = question.Id }, question);
        }

        // PUT: api/Question/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, Question updatedQuestion)
        {
            if (id != updatedQuestion.Id) return BadRequest();

            var existingQuestion = await _context.Questions
                                                 .Include(q => q.Options)
                                                 .FirstOrDefaultAsync(q => q.Id == id);
            if (existingQuestion == null) return NotFound();

            // Mettre à jour les champs simples
            existingQuestion.Texte = updatedQuestion.Texte;
            existingQuestion.Type = updatedQuestion.Type;

            // Gérer les options si type = Liste
            if (updatedQuestion.Type == QuestionType.Liste)
            {
                // Supprimer les options qui ne sont plus présentes
                var optionsToRemove = existingQuestion.Options
                                                     .Where(o => !updatedQuestion.Options.Any(uo => uo.Id == o.Id))
                                                     .ToList();
                _context.ResponseOptions.RemoveRange(optionsToRemove);

                // Ajouter ou mettre à jour les options existantes
                foreach (var option in updatedQuestion.Options)
                {
                    var existingOption = existingQuestion.Options.FirstOrDefault(o => o.Id == option.Id);
                    if (existingOption != null)
                        existingOption.Valeur = option.Valeur;
                    else
                        existingQuestion.Options.Add(option);
                }
            }
            else
            {
                // Si le type n'est plus Liste, supprimer toutes les options existantes
                _context.ResponseOptions.RemoveRange(existingQuestion.Options);
            }

            await _context.SaveChangesAsync();
            return NoContent();
        }

        // DELETE: api/Question/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var question = await _context.Questions
                                         .Include(q => q.Options)
                                         .FirstOrDefaultAsync(q => q.Id == id);
            if (question == null) return NotFound();

            _context.ResponseOptions.RemoveRange(question.Options); // Supprimer les options
            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
