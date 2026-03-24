namespace ERP.Entities.Models
{
    public interface IBaseEntity<TKey>
    {
        TKey Id { get; set; }
    }
}
