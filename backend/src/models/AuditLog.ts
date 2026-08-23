import mongoose, { Schema, Document } from 'mongoose';

export interface IAuditLog extends Document {
  adminId: string;
  action: string;
  resourceType: string;
  resourceId: string;
  changes: any;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

const AuditLogSchema = new Schema<IAuditLog>(
  {
    adminId: {
      type: String,
      required: true,
      index: true
    },
    action: {
      type: String,
      required: true
    },
    resourceType: {
      type: String,
      required: true,
      index: true
    },
    resourceId: {
      type: String,
      required: true,
      index: true
    },
    changes: {
      type: Schema.Types.Mixed,
      default: {}
    },
    ipAddress: {
      type: String,
      required: true
    },
    userAgent: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: -1
    }
  },
  {
    timestamps: false
  }
);

// Compound indexes
AuditLogSchema.index({ adminId: 1, timestamp: -1 });
AuditLogSchema.index({ resourceType: 1, resourceId: 1 });

export const AuditLog = mongoose.model<IAuditLog>('AuditLog', AuditLogSchema);
