using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace CRMService.Domain.Entities
{
    public class ServiceImage
    {
        public Guid Id { get; private set; }
        public Guid ServiceId { get; private set; }

        /// <summary>URL в Azure Blob Storage / S3</summary>
        public string ImageUrl { get; private set; } = default!;

        /// <summary>Чи є це обкладинкою послуги</summary>
        public bool IsCover { get; private set; }

        public int SortOrder { get; private set; }
        public DateTime UploadedAt { get; private set; }

        // Navigation
        public Service Service { get; private set; } = default!;

        private ServiceImage() { } // EF Core

        internal ServiceImage(Guid serviceId, string imageUrl, bool isCover, int sortOrder)
        {
            Id = Guid.NewGuid();
            ServiceId = serviceId;
            ImageUrl = imageUrl;
            IsCover = isCover;
            SortOrder = sortOrder;
            UploadedAt = DateTime.UtcNow;
        }

        internal void SetCover(bool isCover) => IsCover = isCover;
        internal void SetSortOrder(int order) => SortOrder = order;
    }
}
