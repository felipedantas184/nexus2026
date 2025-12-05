// lib/utils/activityValidation.ts - NOVO ARQUIVO
import { Activity, ActivityType } from '@/types/activity.types';

export const validateActivityData = (activityData: any, type: ActivityType): string[] => {
  const errors: string[] = [];

  // Validações básicas
  if (!activityData.title?.trim()) {
    errors.push('Título é obrigatório');
  }

  if (!activityData.moduleId) {
    errors.push('ID do módulo é obrigatório');
  }

  // Validações específicas por tipo
  switch (type) {
    case 'text':
      if (!activityData.content?.trim()) {
        errors.push('Conteúdo é obrigatório para atividades de texto');
      }
      break;

    case 'video':
      if (!activityData.videoUrl?.trim()) {
        errors.push('URL do vídeo é obrigatória');
      }
      break;

    case 'quiz':
      if (activityData.passingScore < 0 || activityData.passingScore > 100) {
        errors.push('Pontuação de aprovação deve estar entre 0 e 100');
      }
      break;

    case 'checklist':
      if (!activityData.items || activityData.items.length === 0) {
        errors.push('Checklist deve ter pelo menos um item');
      }
      break;

    case 'file':
      if (!activityData.fileUrl?.trim()) {
        errors.push('URL do arquivo é obrigatória');
      }
      break;

    case 'habit':
      if (!['daily', 'weekly', 'monthly'].includes(activityData.frequency)) {
        errors.push('Frequência deve ser daily, weekly ou monthly');
      }
      break;
  }

  return errors;
};

export const formatActivityData = (activityData: any, type: ActivityType) => {
  const baseData = {
    title: activityData.title?.trim(),
    description: activityData.description?.trim(),
    instructions: activityData.instructions?.trim(),
    order: parseInt(activityData.order) || 1,
    estimatedTime: parseInt(activityData.estimatedTime) || 15,
    points: parseInt(activityData.points) || 10,
    isRequired: Boolean(activityData.isRequired),
    moduleId: activityData.moduleId
  };

  // Dados específicos por tipo
  const typeSpecificData: any = {};

  switch (type) {
    case 'text':
      typeSpecificData.content = activityData.content?.trim() || '';
      typeSpecificData.richText = Boolean(activityData.richText);
      break;

    case 'video':
      typeSpecificData.videoUrl = activityData.videoUrl?.trim() || '';
      typeSpecificData.thumbnailUrl = activityData.thumbnailUrl?.trim() || '';
      break;

    case 'quiz':
      typeSpecificData.passingScore = parseInt(activityData.passingScore) || 70;
      typeSpecificData.questions = activityData.questions || [];
      break;

    case 'checklist':
      typeSpecificData.items = (activityData.items || []).map((item: string, index: number) => ({
        id: `item-${Date.now()}-${index}`,
        label: item.trim(),
        isCompleted: false,
        order: index
      })).filter((item: any) => item.label); // Remover itens vazios
      break;

    case 'file':
      typeSpecificData.fileUrl = activityData.fileUrl?.trim() || '';
      typeSpecificData.fileName = activityData.fileName?.trim() || 'Arquivo';
      typeSpecificData.fileType = activityData.fileType?.trim() || 'application/octet-stream';
      typeSpecificData.fileSize = parseInt(activityData.fileSize) || 0;
      break;

    case 'habit':
      typeSpecificData.frequency = activityData.frequency || 'daily';
      typeSpecificData.schedule = {
        specificTimes: activityData.schedule?.specificTimes || [],
        daysOfWeek: activityData.schedule?.daysOfWeek || [],
        reminder: Boolean(activityData.schedule?.reminder),
        reminderTime: activityData.schedule?.reminderTime || ''
      };
      typeSpecificData.streak = 0;
      typeSpecificData.maxStreak = 0;
      typeSpecificData.completionHistory = [];
      break;
  }

  return {
    ...baseData,
    ...typeSpecificData,
    type
  };
};