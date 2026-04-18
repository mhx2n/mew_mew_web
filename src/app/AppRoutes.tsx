import React from 'react';
import { Routes, Route } from 'react-router-dom';
import QuizInput from '../features/quiz/components/editor/QuizInput';
import QuizList from '../features/quiz/components/list/QuizList';
import SettingsPage from '../features/settings/pages/SettingsPage';
import About from '../features/about/pages/About';
import AuthPage from '../features/auth/pages/AuthPage';
import ProfilePage from '../features/profile/pages/ProfilePage';
import ChannelFormattingOverview from '../features/settings/components/channel/ChannelFormattingOverview';
import CSVModifier from '../features/quiz/components/export/CSVModifier';
import DraftPage from '../features/draft/pages/DraftPage';
import QBSPage from '../features/qbs/pages/QBSPage';
import AdminDashboard from '../features/admin/pages/AdminDashboard';
import AdminStats from '../features/admin/pages/AdminStats';
import FeatureDirectory from '../features/admin/pages/FeatureDirectory';
import ProtectedRoute from '../components/ProtectedRoute';
import { useAppInit } from './useAppInit';
import { useDrafts } from '../features/draft/hooks/useDrafts';
import { useAuth } from '../features/auth/hooks/useAuth';

interface AppRoutesProps {
  appState: ReturnType<typeof useAppInit>;
}

export default function AppRoutes({ appState }: AppRoutesProps) {
  const { settings, quiz, telegram, pendingQuestions, sentQuestions, botToken } = appState;
  const { moveManyToDraft } = useDrafts();
  const { isAdmin } = useAuth();

  const handleDraftSelected = async (ids: string[]) => {
    const selectedQuestions = pendingQuestions.filter(q => ids.includes(q.id));
    await moveManyToDraft(selectedQuestions);
    quiz.removeQuestions(ids);
  };

  return (
    <Routes>
      <Route 
        path="/system-stats" 
        element={
          <ProtectedRoute>
            {isAdmin ? <AdminStats /> : <div className="p-8 text-center">Access Denied</div>}
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin/features" 
        element={
          <ProtectedRoute>
            {isAdmin ? <FeatureDirectory /> : <div className="p-8 text-center">Access Denied</div>}
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/admin" 
        element={
          <ProtectedRoute>
            {isAdmin ? <AdminDashboard /> : <div className="p-8 text-center">Access Denied</div>}
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/" 
        element={
          <ProtectedRoute>
            <div className="w-full px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                <div className="lg:col-span-5">
                  <QuizInput 
                    inputText={quiz.inputText}
                    setInputText={quiz.setInputText}
                    questionCount={quiz.questionCount}
                    setQuestionCount={quiz.setQuestionCount}
                    isGenerating={quiz.isGenerating}
                    error={quiz.error || telegram.sendError}
                    handleGenerate={quiz.handleGenerate}
                    handleGenerateMore={quiz.handleGenerateMore}
                    lastInputText={quiz.lastInputText}
                    addManualQuestion={quiz.addManualQuestion}
                  />
                </div>
                <div className="lg:col-span-7">
                  <QuizList 
                    questions={pendingQuestions}
                    setQuestions={quiz.setQuestions}
                    handleSendAll={() => telegram.handleSendAll(pendingQuestions)}
                    handleSendSelected={telegram.handleSendSelected}
                    onDraftSelected={handleDraftSelected}
                    handleSendToTelegram={telegram.handleSendToTelegram}
                    removeQuestion={quiz.removeQuestion}
                    removeQuestions={quiz.removeQuestions}
                    editingQuestionId={quiz.editingQuestionId}
                    setEditingQuestionId={quiz.setEditingQuestionId}
                    editingQuestion={quiz.editingQuestion}
                    setEditingQuestion={quiz.setEditingQuestion}
                    stats={quiz.stats}
                    settings={settings.settings}
                    onChannelChange={(id) => settings.saveSettings({ ...settings.settings, activeChannelId: id })}
                  />
                </div>
              </div>
            </div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/drafts" 
        element={
          <ProtectedRoute permission="drafts">
            <DraftPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/polls" 
        element={
          <ProtectedRoute permission="polls">
            <div className="max-w-4xl mx-auto">
              <QuizList 
                questions={sentQuestions}
                setQuestions={quiz.setQuestions}
                handleSendAll={() => telegram.handleSendAll(sentQuestions)}
                handleSendSelected={telegram.handleSendSelected}
                handleSendToTelegram={telegram.handleSendToTelegram}
                removeQuestion={quiz.removeQuestion}
                removeQuestions={quiz.removeQuestions}
                editingQuestionId={quiz.editingQuestionId}
                setEditingQuestionId={quiz.setEditingQuestionId}
                editingQuestion={quiz.editingQuestion}
                setEditingQuestion={quiz.setEditingQuestion}
                stats={quiz.stats}
                settings={settings.settings}
                onChannelChange={(id) => settings.saveSettings({ ...settings.settings, activeChannelId: id })}
                title="Total Polls"
                sentLabel="Total Poll"
                sentValue={sentQuestions.length}
                showGeneratedStat={false}
              />
            </div>
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/qbs" 
        element={
          <ProtectedRoute permission="qbs">
            <QBSPage />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/csv-modifier" 
        element={
          <ProtectedRoute permission="csv-modifier">
            <CSVModifier />
          </ProtectedRoute>
        } 
      />
      <Route path="/about" element={<About />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
      <Route 
        path="/channel-formats" 
        element={
          <ProtectedRoute permission="formats">
            <ChannelFormattingOverview settings={settings.settings} />
          </ProtectedRoute>
        } 
      />
      <Route 
        path="/settings" 
        element={
          <SettingsPage
            settings={settings.settings}
            setSettings={settings.setSettings}
            saveSettings={settings.saveSettings}
            botToken={botToken}
          />
        } 
      />
    </Routes>
  );
}
