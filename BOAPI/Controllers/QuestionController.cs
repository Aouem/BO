using BOAPI.Data;
using BOAPI.DTOs;
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
        public async Task<ActionResult<IEnumerable<QuestionDto>>> GetAll()
        {
            var questions = await _context.Questions
                                          .Include(q => q.Options)
                                          .ToListAsync();

            var result = questions.Select(q => new QuestionDto
            {
                Id = q.Id,
                Texte = q.Texte,
                Type = q.Type.ToString(), // Conversion enum -> string
                Options = q.Options.Select(o => new ResponseOptionDto
                {
                    Id = o.Id,
                    Valeur = o.Valeur
                }).ToList(),
                Reponse = q.Reponse
            }).ToList();

            return Ok(result);
        }

        // GET: api/Question/5
        [HttpGet("{id}")]
        public async Task<ActionResult<QuestionDto>> GetById(int id)
        {
            var question = await _context.Questions
                                         .Include(q => q.Options)
                                         .FirstOrDefaultAsync(q => q.Id == id);

            if (question == null) return NotFound();

            var dto = new QuestionDto
            {
                Id = question.Id,
                Texte = question.Texte,
                Type = question.Type.ToString(),
                Options = question.Options.Select(o => new ResponseOptionDto
                {
                    Id = o.Id,
                    Valeur = o.Valeur
                }).ToList(),
                Reponse = question.Reponse
            };

            return Ok(dto);
        }

        // POST: api/Question
        [HttpPost]
        public async Task<ActionResult<QuestionDto>> Create(QuestionDto dto)
        {
            var question = new Question
            {
                Texte = dto.Texte,
                Type = Enum.Parse<QuestionType>(dto.Type, true), // string -> enum
                Options = dto.Options?.Select(o => new ResponseOption
                {
                    Valeur = o.Valeur
                }).ToList() ?? new List<ResponseOption>(),
                Reponse = dto.Reponse
            };

            _context.Questions.Add(question);
            await _context.SaveChangesAsync();

            dto.Id = question.Id;
            return CreatedAtAction(nameof(GetById), new { id = question.Id }, dto);
        }

        // PUT: api/Question/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, QuestionDto dto)
        {
            if (id != dto.Id) return BadRequest();

            var existingQuestion = await _context.Questions
                                                 .Include(q => q.Options)
                                                 .FirstOrDefaultAsync(q => q.Id == id);
            if (existingQuestion == null) return NotFound();

            // Mettre à jour les champs simples
            existingQuestion.Texte = dto.Texte;
            existingQuestion.Type = Enum.Parse<QuestionType>(dto.Type, true);

            // Gérer les options si type = Liste
            if (existingQuestion.Type == QuestionType.Liste)
            {
                // Supprimer les options qui ne sont plus présentes
                var optionsToRemove = existingQuestion.Options
                                                     .Where(o => dto.Options == null || !dto.Options.Any(uo => uo.Id == o.Id))
                                                     .ToList();
                _context.ResponseOptions.RemoveRange(optionsToRemove);

                // Ajouter ou mettre à jour les options existantes
                if (dto.Options != null)
                {
                    foreach (var optionDto in dto.Options)
                    {
                        var existingOption = existingQuestion.Options.FirstOrDefault(o => o.Id == optionDto.Id);
                        if (existingOption != null)
                            existingOption.Valeur = optionDto.Valeur;
                        else
                            existingQuestion.Options.Add(new ResponseOption { Valeur = optionDto.Valeur });
                    }
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

            _context.ResponseOptions.RemoveRange(question.Options);
            _context.Questions.Remove(question);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
