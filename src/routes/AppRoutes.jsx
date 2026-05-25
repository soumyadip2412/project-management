import { lazy } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { ROUTES } from "@/constants";
import { ProtectedRoute } from "./ProtectedRoute";
import { RoleRoute } from "./RoleRoute";
import { RootLayout } from "@/layouts/RootLayout";
import { LandingLayout } from "@/layouts/LandingLayout";
import { AuthLayout } from "@/layouts/AuthLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";

const LandingPage = lazy(() => import("@/pages/landing/LandingPage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const SignupPage = lazy(() => import("@/pages/auth/SignupPage"));
const ForgotPasswordPage = lazy(() => import("@/pages/auth/ForgotPasswordPage"));
const ResetPasswordPage = lazy(() => import("@/pages/auth/ResetPasswordPage"));
const VerifyEmailPage = lazy(() => import("@/pages/auth/VerifyEmailPage"));
const DashboardPage = lazy(() => import("@/pages/dashboard/DashboardPage"));
const ProjectsPage = lazy(() => import("@/pages/projects/ProjectsPage"));
const ProjectDetailsPage = lazy(() => import("@/pages/projects/ProjectDetailsPage"));
const AnalyticsPage = lazy(() => import("@/pages/analytics/AnalyticsPage"));
const SettingsPage = lazy(() => import("@/pages/settings/SettingsPage"));
const NotFoundPage = lazy(() => import("@/pages/not-found/NotFoundPage"));

export function AppRoutes() {
  return (
    <Routes>
      <Route element={<RootLayout />}>
        <Route element={<LandingLayout />}>
          <Route index element={<LandingPage />} />
        </Route>

        <Route element={<AuthLayout />}>
          <Route path="auth/login" element={<LoginPage />} />
          <Route path="auth/signup" element={<SignupPage />} />
          <Route path="auth/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="auth/reset-password/:token" element={<ResetPasswordPage />} />
          <Route path="auth/verify-email/:token" element={<VerifyEmailPage />} />
        </Route>

        <Route
          path="app"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to={ROUTES.dashboard} replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route
            path="projects/:projectId"
            element={
              <RoleRoute allowedRoles={["admin", "project_admin", "member"]}>
                <ProjectDetailsPage />
              </RoleRoute>
            }
          />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}