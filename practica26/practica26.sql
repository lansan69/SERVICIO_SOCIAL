-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost
-- Tiempo de generación: 09-03-2026 a las 05:05:24
-- Versión del servidor: 10.1.38-MariaDB
-- Versión de PHP: 5.6.40

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `trees`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `cita`
--

CREATE TABLE `cita` (
  `id_cita` int(11) NOT NULL,
  `nom_cita` varchar(150) NOT NULL,
  `id_eje2` int(11) DEFAULT NULL,
  `date_cita` date DEFAULT NULL,
  `hora_cit` time DEFAULT NULL,
  `est_cit` varchar(50) DEFAULT NULL,
  `efe_cit` varchar(50) DEFAULT NULL,
  `is_active` tinyint(1) DEFAULT '1',
  `id_pla` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `cita`
--

INSERT INTO `cita` (`id_cita`, `nom_cita`, `id_eje2`, `date_cita`, `hora_cit`, `est_cit`, `efe_cit`, `is_active`, `id_pla`) VALUES
(1, 'Cita A - Asesor 40', 40, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA NO EFECTIVA', 1, 'ECA'),
(2, 'Cita B - Asesor 40', 40, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(3, 'Cita A - Asesor 41', 41, '2026-03-08', NULL, 'CITA REAGENDADA', 'CITA NO EFECTIVA', 1, 'ECA'),
(4, 'Cita B - Asesor 41', 41, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(5, 'Cita A - Asesor 42', 42, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(6, 'Cita B - Asesor 42', 42, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(7, 'Cita A - Asesor 43', 43, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(8, 'Cita B - Asesor 43', 43, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(9, 'Cita A - Asesor 44', 44, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(10, 'Cita B - Asesor 44', 44, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(11, 'Cita A - Asesor 45', 45, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(12, 'Cita B - Asesor 45', 45, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(13, 'Cita A - Asesor 46', 46, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(14, 'Cita B - Asesor 46', 46, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(15, 'Cita A - Asesor 47', 47, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(16, 'Cita B - Asesor 47', 47, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(17, 'Cita A - Asesor 48', 48, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(18, 'Cita B - Asesor 48', 48, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(19, 'Cita A - Asesor 49', 49, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(20, 'Cita B - Asesor 49', 49, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(21, 'Cita A - Asesor 50', 50, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(22, 'Cita B - Asesor 50', 50, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(23, 'Cita A - Asesor 51', 51, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(24, 'Cita B - Asesor 51', 51, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(25, 'Cita A - Asesor 52', 52, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(26, 'Cita B - Asesor 52', 52, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(27, 'Cita A - Asesor 53', 53, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(28, 'Cita B - Asesor 53', 53, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(29, 'Cita A - Asesor 54', 54, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(30, 'Cita B - Asesor 54', 54, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(31, 'Cita A - Asesor 55', 55, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(32, 'Cita B - Asesor 55', 55, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(33, 'Cita A - Asesor 56', 56, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(34, 'Cita B - Asesor 56', 56, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(35, 'Cita A - Asesor 57', 57, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(36, 'Cita B - Asesor 57', 57, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(37, 'Cita A - Asesor 58', 58, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(38, 'Cita B - Asesor 58', 58, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(39, 'Cita A - Asesor 59', 59, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(40, 'Cita B - Asesor 59', 59, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(41, 'Cita A - Asesor 60', 60, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(42, 'Cita B - Asesor 60', 60, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(43, 'Cita A - Asesor 61', 61, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(44, 'Cita B - Asesor 61', 61, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(45, 'Cita A - Asesor 62', 62, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(46, 'Cita B - Asesor 62', 62, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(47, 'Cita A - Asesor 63', 63, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(48, 'Cita B - Asesor 63', 63, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(49, 'Cita A - Asesor 64', 64, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(50, 'Cita B - Asesor 64', 64, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(51, 'Cita A - Asesor 65', 65, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(52, 'Cita B - Asesor 65', 65, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(53, 'Cita A - Asesor 66', 66, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'ECA'),
(54, 'Cita B - Asesor 66', 66, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'ECA'),
(55, 'Cita A - Asesor 67', 67, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(56, 'Cita B - Asesor 67', 67, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(57, 'Cita A - Asesor 68', 68, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(58, 'Cita B - Asesor 68', 68, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(59, 'Cita A - Asesor 69', 69, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(60, 'Cita B - Asesor 69', 69, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(61, 'Cita A - Asesor 70', 70, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(62, 'Cita B - Asesor 70', 70, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(63, 'Cita A - Asesor 71', 71, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(64, 'Cita B - Asesor 71', 71, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(65, 'Cita A - Asesor 72', 72, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(66, 'Cita B - Asesor 72', 72, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(67, 'Cita A - Asesor 73', 73, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(68, 'Cita B - Asesor 73', 73, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(69, 'Cita A - Asesor 74', 74, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(70, 'Cita B - Asesor 74', 74, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(71, 'Cita A - Asesor 75', 75, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(72, 'Cita B - Asesor 75', 75, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(73, 'Cita A - Asesor 76', 76, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(74, 'Cita B - Asesor 76', 76, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(75, 'Cita A - Asesor 77', 77, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(76, 'Cita B - Asesor 77', 77, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(77, 'Cita A - Asesor 78', 78, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(78, 'Cita B - Asesor 78', 78, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(79, 'Cita A - Asesor 79', 79, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(80, 'Cita B - Asesor 79', 79, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(81, 'Cita A - Asesor 80', 80, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(82, 'Cita B - Asesor 80', 80, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(83, 'Cita A - Asesor 81', 81, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(84, 'Cita B - Asesor 81', 81, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(85, 'Cita A - Asesor 82', 82, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(86, 'Cita B - Asesor 82', 82, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(87, 'Cita A - Asesor 83', 83, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(88, 'Cita B - Asesor 83', 83, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(89, 'Cita A - Asesor 84', 84, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(90, 'Cita B - Asesor 84', 84, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(91, 'Cita A - Asesor 85', 85, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(92, 'Cita B - Asesor 85', 85, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(93, 'Cita A - Asesor 86', 86, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(94, 'Cita B - Asesor 86', 86, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(95, 'Cita A - Asesor 87', 87, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(96, 'Cita B - Asesor 87', 87, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(97, 'Cita A - Asesor 88', 88, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(98, 'Cita B - Asesor 88', 88, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(99, 'Cita A - Asesor 89', 89, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(100, 'Cita B - Asesor 89', 89, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(101, 'Cita A - Asesor 90', 90, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(102, 'Cita B - Asesor 90', 90, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(103, 'Cita A - Asesor 91', 91, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(104, 'Cita B - Asesor 91', 91, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(105, 'Cita A - Asesor 92', 92, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(106, 'Cita B - Asesor 92', 92, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(107, 'Cita A - Asesor 93', 93, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'NAU'),
(108, 'Cita B - Asesor 93', 93, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'NAU'),
(109, 'Cita A - Asesor 94', 94, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(110, 'Cita B - Asesor 94', 94, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(111, 'Cita A - Asesor 95', 95, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(112, 'Cita B - Asesor 95', 95, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(113, 'Cita A - Asesor 96', 96, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(114, 'Cita B - Asesor 96', 96, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(115, 'Cita A - Asesor 97', 97, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(116, 'Cita B - Asesor 97', 97, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(117, 'Cita A - Asesor 98', 98, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(118, 'Cita B - Asesor 98', 98, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(119, 'Cita A - Asesor 99', 99, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(120, 'Cita B - Asesor 99', 99, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(121, 'Cita A - Asesor 100', 100, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(122, 'Cita B - Asesor 100', 100, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(123, 'Cita A - Asesor 101', 101, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(124, 'Cita B - Asesor 101', 101, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(125, 'Cita A - Asesor 102', 102, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(126, 'Cita B - Asesor 102', 102, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(127, 'Cita A - Asesor 103', 103, '2026-03-08', NULL, 'INVASIÓN DE CICLO', 'CITA EFECTIVA', 1, 'TLA'),
(128, 'Cita B - Asesor 103', 103, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(129, 'Cita A - Asesor 104', 104, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(130, 'Cita B - Asesor 104', 104, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(131, 'Cita A - Asesor 105', 105, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(132, 'Cita B - Asesor 105', 105, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(133, 'Cita A - Asesor 106', 106, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(134, 'Cita B - Asesor 106', 106, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(135, 'Cita A - Asesor 107', 107, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(136, 'Cita B - Asesor 107', 107, '2026-03-09', NULL, 'INVASIÓN DE CICLO', 'CITA NO EFECTIVA', 1, 'TLA'),
(137, 'Cita A - Asesor 108', 108, '2026-03-08', NULL, 'CITA REAGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(138, 'Cita B - Asesor 108', 108, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(139, 'Cita A - Asesor 109', 109, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(140, 'Cita B - Asesor 109', 109, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(141, 'Cita A - Asesor 110', 110, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(142, 'Cita B - Asesor 110', 110, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(143, 'Cita A - Asesor 111', 111, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(144, 'Cita B - Asesor 111', 111, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(145, 'Cita A - Asesor 112', 112, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(146, 'Cita B - Asesor 112', 112, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(147, 'Cita A - Asesor 113', 113, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(148, 'Cita B - Asesor 113', 113, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(149, 'Cita A - Asesor 114', 114, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(150, 'Cita B - Asesor 114', 114, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(151, 'Cita A - Asesor 115', 115, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(152, 'Cita B - Asesor 115', 115, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(153, 'Cita A - Asesor 116', 116, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(154, 'Cita B - Asesor 116', 116, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(155, 'Cita A - Asesor 117', 117, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(156, 'Cita B - Asesor 117', 117, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(157, 'Cita A - Asesor 118', 118, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(158, 'Cita B - Asesor 118', 118, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(159, 'Cita A - Asesor 119', 119, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(160, 'Cita B - Asesor 119', 119, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA'),
(161, 'Cita A - Asesor 120', 120, '2026-03-08', NULL, 'CITA AGENDADA', 'CITA EFECTIVA', 1, 'TLA'),
(162, 'Cita B - Asesor 120', 120, '2026-03-09', NULL, 'REGISTRO', 'CITA NO EFECTIVA', 1, 'TLA');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `comentario`
--

CREATE TABLE `comentario` (
  `id_cita` int(11) NOT NULL,
  `id_row` varchar(50) NOT NULL,
  `comentario` text NOT NULL,
  `active` tinyint(1) DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ejecutivo`
--

CREATE TABLE `ejecutivo` (
  `id_eje` int(11) NOT NULL,
  `nom_eje` varchar(150) NOT NULL,
  `tel_eje` varchar(20) DEFAULT NULL,
  `id_padre` int(11) DEFAULT NULL,
  `id_pla` varchar(50) DEFAULT NULL,
  `eli_eje` tinyint(1) DEFAULT '1',
  `ult_eje` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `ejecutivo`
--

INSERT INTO `ejecutivo` (`id_eje`, `nom_eje`, `tel_eje`, `id_padre`, `id_pla`, `eli_eje`, `ult_eje`) VALUES
(1, 'Director Ecatepec', NULL, NULL, 'ECA', 1, NULL),
(2, 'Director Naucalpan', NULL, NULL, 'NAU', 1, NULL),
(3, 'Director Tlalpan', NULL, NULL, 'TLA', 1, NULL),
(4, 'Subdirector 1 Ecatepec', NULL, 1, 'ECA', 1, NULL),
(5, 'Subdirector 2 Ecatepec', NULL, 1, 'ECA', 1, NULL),
(6, 'Subdirector 3 Ecatepec', NULL, 1, 'ECA', 1, NULL),
(7, 'Subdirector 1 Naucalpan', NULL, 2, 'NAU', 1, NULL),
(8, 'Subdirector 2 Naucalpan', NULL, 2, 'NAU', 1, NULL),
(9, 'Subdirector 3 Naucalpan', NULL, 2, 'NAU', 1, NULL),
(10, 'Subdirector 1 Tlalpan', NULL, 3, 'TLA', 1, NULL),
(11, 'Subdirector 2 Tlalpan', NULL, 3, 'TLA', 1, NULL),
(12, 'Subdirector 3 Tlalpan', NULL, 3, 'TLA', 1, NULL),
(13, 'Supervisor 1 ECA', NULL, 4, 'ECA', 1, NULL),
(14, 'Supervisor 2 ECA', NULL, 4, 'ECA', 1, NULL),
(15, 'Supervisor 3 ECA', NULL, 4, 'ECA', 1, NULL),
(16, 'Supervisor 4 ECA', NULL, 5, 'ECA', 1, NULL),
(17, 'Supervisor 5 ECA', NULL, 5, 'ECA', 1, NULL),
(18, 'Supervisor 6 ECA', NULL, 5, 'ECA', 1, NULL),
(19, 'Supervisor 7 ECA', NULL, 6, 'ECA', 1, NULL),
(20, 'Supervisor 8 ECA', NULL, 6, 'ECA', 1, NULL),
(21, 'Supervisor 9 ECA', NULL, 6, 'ECA', 1, NULL),
(22, 'Supervisor 1 NAU', NULL, 7, 'NAU', 1, NULL),
(23, 'Supervisor 2 NAU', NULL, 7, 'NAU', 1, NULL),
(24, 'Supervisor 3 NAU', NULL, 7, 'NAU', 1, NULL),
(25, 'Supervisor 4 NAU', NULL, 8, 'NAU', 1, NULL),
(26, 'Supervisor 5 NAU', NULL, 8, 'NAU', 1, NULL),
(27, 'Supervisor 6 NAU', NULL, 8, 'NAU', 1, NULL),
(28, 'Supervisor 7 NAU', NULL, 9, 'NAU', 1, NULL),
(29, 'Supervisor 8 NAU', NULL, 9, 'NAU', 1, NULL),
(30, 'Supervisor 9 NAU', NULL, 9, 'NAU', 1, NULL),
(31, 'Supervisor 1 TLA', NULL, 10, 'TLA', 1, NULL),
(32, 'Supervisor 2 TLA', NULL, 10, 'TLA', 1, NULL),
(33, 'Supervisor 3 TLA', NULL, 10, 'TLA', 1, NULL),
(34, 'Supervisor 4 TLA', NULL, 11, 'TLA', 1, NULL),
(35, 'Supervisor 5 TLA', NULL, 11, 'TLA', 1, NULL),
(36, 'Supervisor 6 TLA', NULL, 11, 'TLA', 1, NULL),
(37, 'Supervisor 7 TLA', NULL, 12, 'TLA', 1, NULL),
(38, 'Supervisor 8 TLA', NULL, 39, 'TLA', 1, NULL),
(39, 'Supervisor 9 TLA', NULL, 12, 'TLA', 1, NULL),
(40, 'Asesor 40', NULL, 13, 'ECA', 1, NULL),
(41, 'Asesor 41', NULL, 13, 'ECA', 1, NULL),
(42, 'Asesor 42', NULL, 13, 'ECA', 1, NULL),
(43, 'Asesor 43', NULL, 14, 'ECA', 1, NULL),
(44, 'Asesor 44', NULL, 14, 'ECA', 1, NULL),
(45, 'Asesor 45', NULL, 14, 'ECA', 1, NULL),
(46, 'Asesor 46', NULL, 15, 'ECA', 1, NULL),
(47, 'Asesor 47', NULL, 15, 'ECA', 1, NULL),
(48, 'Asesor 48', NULL, 15, 'ECA', 1, NULL),
(49, 'Asesor 49', NULL, 16, 'ECA', 1, NULL),
(50, 'Asesor 50', NULL, 16, 'ECA', 1, NULL),
(51, 'Asesor 51', NULL, 16, 'ECA', 1, NULL),
(52, 'Asesor 52', NULL, 17, 'ECA', 1, NULL),
(53, 'Asesor 53', NULL, 17, 'ECA', 1, NULL),
(54, 'Asesor 54', NULL, 17, 'ECA', 1, NULL),
(55, 'Asesor 55', NULL, 18, 'ECA', 1, NULL),
(56, 'Asesor 56', NULL, 18, 'ECA', 1, NULL),
(57, 'Asesor 57', NULL, 18, 'ECA', 1, NULL),
(58, 'Asesor 58', NULL, 19, 'ECA', 1, NULL),
(59, 'Asesor 59', NULL, 19, 'ECA', 1, NULL),
(60, 'Asesor 60', NULL, 19, 'ECA', 1, NULL),
(61, 'Asesor 61', NULL, 20, 'ECA', 1, NULL),
(62, 'Asesor 62', NULL, 20, 'ECA', 1, NULL),
(63, 'Asesor 63', NULL, 20, 'ECA', 1, NULL),
(64, 'Asesor 64', NULL, 21, 'ECA', 1, NULL),
(65, 'Asesor 65', NULL, 21, 'ECA', 1, NULL),
(66, 'Asesor 66', NULL, 21, 'ECA', 1, NULL),
(67, 'Asesor 67', NULL, 22, 'NAU', 1, NULL),
(68, 'Asesor 68', NULL, 22, 'NAU', 1, NULL),
(69, 'Asesor 69', NULL, 22, 'NAU', 1, NULL),
(70, 'Asesor 70', NULL, 23, 'NAU', 1, NULL),
(71, 'Asesor 71', NULL, 23, 'NAU', 1, NULL),
(72, 'Asesor 72', NULL, 23, 'NAU', 1, NULL),
(73, 'Asesor 73', NULL, 24, 'NAU', 1, NULL),
(74, 'Asesor 74', NULL, 24, 'NAU', 1, NULL),
(75, 'Asesor 75', NULL, 24, 'NAU', 1, NULL),
(76, 'Asesor 76', NULL, 25, 'NAU', 1, NULL),
(77, 'Asesor 77', NULL, 25, 'NAU', 1, NULL),
(78, 'Asesor 78', NULL, 25, 'NAU', 1, NULL),
(79, 'Asesor 79', NULL, 26, 'NAU', 1, NULL),
(80, 'Asesor 80', NULL, 26, 'NAU', 1, NULL),
(81, 'Asesor 81', NULL, 26, 'NAU', 1, NULL),
(82, 'Asesor 82', NULL, 27, 'NAU', 1, NULL),
(83, 'Asesor 83', NULL, 27, 'NAU', 1, NULL),
(84, 'Asesor 84', NULL, 27, 'NAU', 1, NULL),
(85, 'Asesor 85', NULL, 28, 'NAU', 1, NULL),
(86, 'Asesor 86', NULL, 28, 'NAU', 1, NULL),
(87, 'Asesor 87', NULL, 28, 'NAU', 1, NULL),
(88, 'Asesor 88', NULL, 29, 'NAU', 1, NULL),
(89, 'Asesor 89', NULL, 29, 'NAU', 1, NULL),
(90, 'Asesor 90', NULL, 29, 'NAU', 1, NULL),
(91, 'Asesor 91', NULL, 30, 'NAU', 1, NULL),
(92, 'Asesor 92', NULL, 30, 'NAU', 1, NULL),
(93, 'Asesor 93', NULL, 30, 'NAU', 1, NULL),
(94, 'Asesor 94', NULL, 31, 'TLA', 1, NULL),
(95, 'Asesor 95', NULL, 31, 'TLA', 1, NULL),
(96, 'Asesor 96', NULL, 31, 'TLA', 1, NULL),
(97, 'Asesor 97', NULL, 32, 'TLA', 1, NULL),
(98, 'Asesor 98', NULL, 32, 'TLA', 1, NULL),
(99, 'Asesor 99', NULL, 32, 'TLA', 1, NULL),
(100, 'Asesor 100', NULL, 33, 'TLA', 1, NULL),
(101, 'Asesor 101', NULL, 33, 'TLA', 1, NULL),
(102, 'Asesor 102', NULL, 33, 'TLA', 1, NULL),
(103, 'Asesor 103', NULL, 35, 'TLA', 1, NULL),
(104, 'Asesor 104', NULL, 35, 'TLA', 1, NULL),
(105, 'Asesor 105', NULL, 35, 'TLA', 1, NULL),
(106, 'Asesor 106', NULL, 35, 'TLA', 1, NULL),
(107, 'Asesor 107', NULL, 35, 'TLA', 1, NULL),
(108, 'Asesor 108', NULL, 35, 'TLA', 1, NULL),
(109, 'Asesor 109', NULL, 36, 'TLA', 1, NULL),
(110, 'Asesor 110', NULL, 36, 'TLA', 1, NULL),
(111, 'Asesor 111', NULL, 36, 'TLA', 1, NULL),
(112, 'Asesor 112', NULL, 37, 'TLA', 1, NULL),
(113, 'Asesor 113', NULL, 37, 'TLA', 1, NULL),
(114, 'Asesor 114', NULL, 37, 'TLA', 1, NULL),
(115, 'Asesor 115', NULL, 38, 'TLA', 1, NULL),
(116, 'Asesor 116', NULL, 38, 'TLA', 1, NULL),
(117, 'Asesor 117', NULL, 38, 'TLA', 1, NULL),
(118, 'Asesor 118', NULL, 38, 'TLA', 1, NULL),
(119, 'Asesor 119', NULL, 39, 'TLA', 1, NULL),
(120, 'Asesor 120', NULL, 39, 'TLA', 1, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `estilos_celda`
--

CREATE TABLE `estilos_celda` (
  `id_cita` int(11) NOT NULL,
  `id_col` varchar(50) NOT NULL,
  `class` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `estilos_celda`
--

INSERT INTO `estilos_celda` (`id_cita`, `id_col`, `class`) VALUES
(1, 'efe_cit', 'efectividad-no-efectiva'),
(1, 'est_cit', 'status-agendada'),
(2, 'efe_cit', 'efectividad-no-efectiva'),
(2, 'est_cit', 'status-registro'),
(3, 'date_cita', 'cell-blue'),
(3, 'efe_cit', 'efectividad-no-efectiva'),
(3, 'est_cit', 'status-reagendada'),
(4, 'efe_cit', 'efectividad-no-efectiva'),
(4, 'est_cit', 'status-registro'),
(5, 'efe_cit', 'efectividad-efectiva'),
(5, 'est_cit', 'status-agendada'),
(5, 'nom_cita', 'cell-green'),
(6, 'date_cita', 'cell-blue'),
(6, 'efe_cit', 'efectividad-no-efectiva'),
(6, 'est_cit', 'status-registro'),
(7, 'efe_cit', 'efectividad-efectiva'),
(7, 'est_cit', 'status-agendada'),
(7, 'hora_cit', 'cell-red'),
(8, 'efe_cit', 'efectividad-no-efectiva'),
(8, 'est_cit', 'status-registro'),
(9, 'date_cita', 'cell-blue'),
(9, 'efe_cit', 'efectividad-efectiva'),
(9, 'est_cit', 'status-agendada'),
(10, 'efe_cit', 'efectividad-no-efectiva'),
(10, 'est_cit', 'status-registro'),
(10, 'nom_cita', 'cell-green'),
(11, 'efe_cit', 'efectividad-efectiva'),
(11, 'est_cit', 'status-agendada'),
(12, 'date_cita', 'cell-blue'),
(12, 'efe_cit', 'efectividad-no-efectiva'),
(12, 'est_cit', 'status-registro'),
(13, 'efe_cit', 'efectividad-efectiva'),
(13, 'est_cit', 'status-agendada'),
(14, 'efe_cit', 'efectividad-no-efectiva'),
(14, 'est_cit', 'status-registro'),
(14, 'hora_cit', 'cell-red'),
(15, 'date_cita', 'cell-blue'),
(15, 'efe_cit', 'efectividad-efectiva'),
(15, 'est_cit', 'status-agendada'),
(15, 'nom_cita', 'cell-green'),
(16, 'efe_cit', 'efectividad-no-efectiva'),
(16, 'est_cit', 'status-registro'),
(17, 'efe_cit', 'efectividad-efectiva'),
(17, 'est_cit', 'status-agendada'),
(18, 'date_cita', 'cell-blue'),
(18, 'efe_cit', 'efectividad-no-efectiva'),
(18, 'est_cit', 'status-registro'),
(19, 'efe_cit', 'efectividad-efectiva'),
(19, 'est_cit', 'status-agendada'),
(20, 'efe_cit', 'efectividad-no-efectiva'),
(20, 'est_cit', 'status-registro'),
(20, 'nom_cita', 'cell-green'),
(21, 'date_cita', 'cell-blue'),
(21, 'efe_cit', 'efectividad-efectiva'),
(21, 'est_cit', 'status-agendada'),
(21, 'hora_cit', 'cell-red'),
(22, 'efe_cit', 'efectividad-no-efectiva'),
(22, 'est_cit', 'status-registro'),
(23, 'efe_cit', 'efectividad-efectiva'),
(23, 'est_cit', 'status-agendada'),
(24, 'date_cita', 'cell-blue'),
(24, 'efe_cit', 'efectividad-no-efectiva'),
(24, 'est_cit', 'status-registro'),
(25, 'efe_cit', 'efectividad-efectiva'),
(25, 'est_cit', 'status-agendada'),
(25, 'nom_cita', 'cell-green'),
(26, 'efe_cit', 'efectividad-no-efectiva'),
(26, 'est_cit', 'status-registro'),
(27, 'date_cita', 'cell-blue'),
(27, 'efe_cit', 'efectividad-efectiva'),
(27, 'est_cit', 'status-agendada'),
(28, 'efe_cit', 'efectividad-no-efectiva'),
(28, 'est_cit', 'status-registro'),
(28, 'hora_cit', 'cell-red'),
(29, 'efe_cit', 'efectividad-efectiva'),
(29, 'est_cit', 'status-agendada'),
(30, 'date_cita', 'cell-blue'),
(30, 'efe_cit', 'efectividad-no-efectiva'),
(30, 'est_cit', 'status-registro'),
(30, 'nom_cita', 'cell-green'),
(31, 'efe_cit', 'efectividad-efectiva'),
(31, 'est_cit', 'status-agendada'),
(32, 'efe_cit', 'efectividad-no-efectiva'),
(32, 'est_cit', 'status-registro'),
(33, 'date_cita', 'cell-blue'),
(33, 'efe_cit', 'efectividad-efectiva'),
(33, 'est_cit', 'status-agendada'),
(34, 'efe_cit', 'efectividad-no-efectiva'),
(34, 'est_cit', 'status-registro'),
(35, 'efe_cit', 'efectividad-efectiva'),
(35, 'est_cit', 'status-agendada'),
(35, 'hora_cit', 'cell-red'),
(35, 'nom_cita', 'cell-green'),
(36, 'date_cita', 'cell-blue'),
(36, 'efe_cit', 'efectividad-no-efectiva'),
(36, 'est_cit', 'status-registro'),
(37, 'efe_cit', 'efectividad-efectiva'),
(37, 'est_cit', 'status-agendada'),
(38, 'efe_cit', 'efectividad-no-efectiva'),
(38, 'est_cit', 'status-registro'),
(39, 'date_cita', 'cell-blue'),
(39, 'efe_cit', 'efectividad-efectiva'),
(39, 'est_cit', 'status-agendada'),
(40, 'efe_cit', 'efectividad-no-efectiva'),
(40, 'est_cit', 'status-registro'),
(40, 'nom_cita', 'cell-green'),
(41, 'efe_cit', 'efectividad-efectiva'),
(41, 'est_cit', 'status-agendada'),
(42, 'date_cita', 'cell-blue'),
(42, 'efe_cit', 'efectividad-no-efectiva'),
(42, 'est_cit', 'status-registro'),
(42, 'hora_cit', 'cell-red'),
(43, 'efe_cit', 'efectividad-efectiva'),
(43, 'est_cit', 'status-agendada'),
(44, 'efe_cit', 'efectividad-no-efectiva'),
(44, 'est_cit', 'status-registro'),
(45, 'date_cita', 'cell-blue'),
(45, 'efe_cit', 'efectividad-efectiva'),
(45, 'est_cit', 'status-agendada'),
(45, 'nom_cita', 'cell-green'),
(46, 'efe_cit', 'efectividad-no-efectiva'),
(46, 'est_cit', 'status-registro'),
(47, 'efe_cit', 'efectividad-efectiva'),
(47, 'est_cit', 'status-agendada'),
(48, 'date_cita', 'cell-blue'),
(48, 'efe_cit', 'efectividad-no-efectiva'),
(48, 'est_cit', 'status-registro'),
(49, 'efe_cit', 'efectividad-efectiva'),
(49, 'est_cit', 'status-agendada'),
(49, 'hora_cit', 'cell-red'),
(50, 'efe_cit', 'efectividad-no-efectiva'),
(50, 'est_cit', 'status-registro'),
(50, 'nom_cita', 'cell-green'),
(51, 'date_cita', 'cell-blue'),
(51, 'efe_cit', 'efectividad-efectiva'),
(51, 'est_cit', 'status-agendada'),
(52, 'efe_cit', 'efectividad-no-efectiva'),
(52, 'est_cit', 'status-registro'),
(53, 'efe_cit', 'efectividad-efectiva'),
(53, 'est_cit', 'status-agendada'),
(54, 'date_cita', 'cell-blue'),
(54, 'efe_cit', 'efectividad-no-efectiva'),
(54, 'est_cit', 'status-registro'),
(55, 'efe_cit', 'efectividad-efectiva'),
(55, 'est_cit', 'status-agendada'),
(55, 'nom_cita', 'cell-green'),
(56, 'efe_cit', 'efectividad-no-efectiva'),
(56, 'est_cit', 'status-registro'),
(56, 'hora_cit', 'cell-red'),
(57, 'date_cita', 'cell-blue'),
(57, 'efe_cit', 'efectividad-efectiva'),
(57, 'est_cit', 'status-agendada'),
(58, 'efe_cit', 'efectividad-no-efectiva'),
(58, 'est_cit', 'status-registro'),
(59, 'efe_cit', 'efectividad-efectiva'),
(59, 'est_cit', 'status-agendada'),
(60, 'date_cita', 'cell-blue'),
(60, 'efe_cit', 'efectividad-no-efectiva'),
(60, 'est_cit', 'status-registro'),
(60, 'nom_cita', 'cell-green'),
(61, 'efe_cit', 'efectividad-efectiva'),
(61, 'est_cit', 'status-agendada'),
(62, 'efe_cit', 'efectividad-no-efectiva'),
(62, 'est_cit', 'status-registro'),
(63, 'date_cita', 'cell-blue'),
(63, 'efe_cit', 'efectividad-efectiva'),
(63, 'est_cit', 'status-agendada'),
(63, 'hora_cit', 'cell-red'),
(64, 'efe_cit', 'efectividad-no-efectiva'),
(64, 'est_cit', 'status-registro'),
(65, 'efe_cit', 'efectividad-efectiva'),
(65, 'est_cit', 'status-agendada'),
(65, 'nom_cita', 'cell-green'),
(66, 'date_cita', 'cell-blue'),
(66, 'efe_cit', 'efectividad-no-efectiva'),
(66, 'est_cit', 'status-registro'),
(67, 'efe_cit', 'efectividad-efectiva'),
(67, 'est_cit', 'status-agendada'),
(68, 'efe_cit', 'efectividad-no-efectiva'),
(68, 'est_cit', 'status-registro'),
(69, 'date_cita', 'cell-blue'),
(69, 'efe_cit', 'efectividad-efectiva'),
(69, 'est_cit', 'status-agendada'),
(70, 'efe_cit', 'efectividad-no-efectiva'),
(70, 'est_cit', 'status-registro'),
(70, 'hora_cit', 'cell-red'),
(70, 'nom_cita', 'cell-green'),
(71, 'efe_cit', 'efectividad-efectiva'),
(71, 'est_cit', 'status-agendada'),
(72, 'date_cita', 'cell-blue'),
(72, 'efe_cit', 'efectividad-no-efectiva'),
(72, 'est_cit', 'status-registro'),
(73, 'efe_cit', 'efectividad-efectiva'),
(73, 'est_cit', 'status-agendada'),
(74, 'efe_cit', 'efectividad-no-efectiva'),
(74, 'est_cit', 'status-registro'),
(75, 'date_cita', 'cell-blue'),
(75, 'efe_cit', 'efectividad-efectiva'),
(75, 'est_cit', 'status-agendada'),
(75, 'nom_cita', 'cell-green'),
(76, 'efe_cit', 'efectividad-no-efectiva'),
(76, 'est_cit', 'status-registro'),
(77, 'efe_cit', 'efectividad-efectiva'),
(77, 'est_cit', 'status-agendada'),
(77, 'hora_cit', 'cell-red'),
(78, 'date_cita', 'cell-blue'),
(78, 'efe_cit', 'efectividad-no-efectiva'),
(78, 'est_cit', 'status-registro'),
(79, 'efe_cit', 'efectividad-efectiva'),
(79, 'est_cit', 'status-agendada'),
(80, 'efe_cit', 'efectividad-no-efectiva'),
(80, 'est_cit', 'status-registro'),
(80, 'nom_cita', 'cell-green'),
(81, 'date_cita', 'cell-blue'),
(81, 'efe_cit', 'efectividad-efectiva'),
(81, 'est_cit', 'status-agendada'),
(82, 'efe_cit', 'efectividad-no-efectiva'),
(82, 'est_cit', 'status-registro'),
(83, 'efe_cit', 'efectividad-efectiva'),
(83, 'est_cit', 'status-agendada'),
(84, 'date_cita', 'cell-blue'),
(84, 'efe_cit', 'efectividad-no-efectiva'),
(84, 'est_cit', 'status-registro'),
(84, 'hora_cit', 'cell-red'),
(85, 'efe_cit', 'efectividad-efectiva'),
(85, 'est_cit', 'status-agendada'),
(85, 'nom_cita', 'cell-green'),
(86, 'efe_cit', 'efectividad-no-efectiva'),
(86, 'est_cit', 'status-registro'),
(87, 'date_cita', 'cell-blue'),
(87, 'efe_cit', 'efectividad-efectiva'),
(87, 'est_cit', 'status-agendada'),
(88, 'efe_cit', 'efectividad-no-efectiva'),
(88, 'est_cit', 'status-registro'),
(89, 'efe_cit', 'efectividad-efectiva'),
(89, 'est_cit', 'status-agendada'),
(90, 'date_cita', 'cell-blue'),
(90, 'efe_cit', 'efectividad-no-efectiva'),
(90, 'est_cit', 'status-registro'),
(90, 'nom_cita', 'cell-green'),
(91, 'efe_cit', 'efectividad-efectiva'),
(91, 'est_cit', 'status-agendada'),
(91, 'hora_cit', 'cell-red'),
(92, 'efe_cit', 'efectividad-no-efectiva'),
(92, 'est_cit', 'status-registro'),
(93, 'date_cita', 'cell-blue'),
(93, 'efe_cit', 'efectividad-efectiva'),
(93, 'est_cit', 'status-agendada'),
(94, 'efe_cit', 'efectividad-no-efectiva'),
(94, 'est_cit', 'status-registro'),
(95, 'efe_cit', 'efectividad-efectiva'),
(95, 'est_cit', 'status-agendada'),
(95, 'nom_cita', 'cell-green'),
(96, 'date_cita', 'cell-blue'),
(96, 'efe_cit', 'efectividad-no-efectiva'),
(96, 'est_cit', 'status-registro'),
(97, 'efe_cit', 'efectividad-efectiva'),
(97, 'est_cit', 'status-agendada'),
(98, 'efe_cit', 'efectividad-no-efectiva'),
(98, 'est_cit', 'status-registro'),
(98, 'hora_cit', 'cell-red'),
(99, 'date_cita', 'cell-blue'),
(99, 'efe_cit', 'efectividad-efectiva'),
(99, 'est_cit', 'status-agendada'),
(100, 'efe_cit', 'efectividad-no-efectiva'),
(100, 'est_cit', 'status-registro'),
(100, 'nom_cita', 'cell-green'),
(101, 'efe_cit', 'efectividad-efectiva'),
(101, 'est_cit', 'status-agendada'),
(102, 'date_cita', 'cell-blue'),
(102, 'efe_cit', 'efectividad-no-efectiva'),
(102, 'est_cit', 'status-registro'),
(103, 'efe_cit', 'efectividad-efectiva'),
(103, 'est_cit', 'status-agendada'),
(104, 'efe_cit', 'efectividad-no-efectiva'),
(104, 'est_cit', 'status-registro'),
(105, 'date_cita', 'cell-blue'),
(105, 'efe_cit', 'efectividad-efectiva'),
(105, 'est_cit', 'status-agendada'),
(105, 'hora_cit', 'cell-red'),
(105, 'nom_cita', 'cell-green'),
(106, 'efe_cit', 'efectividad-no-efectiva'),
(106, 'est_cit', 'status-registro'),
(107, 'efe_cit', 'efectividad-efectiva'),
(107, 'est_cit', 'status-agendada'),
(108, 'date_cita', 'cell-blue'),
(108, 'efe_cit', 'efectividad-no-efectiva'),
(108, 'est_cit', 'status-registro'),
(109, 'efe_cit', 'efectividad-efectiva'),
(109, 'est_cit', 'status-agendada'),
(110, 'efe_cit', 'efectividad-no-efectiva'),
(110, 'est_cit', 'status-registro'),
(110, 'nom_cita', 'cell-green'),
(111, 'date_cita', 'cell-blue'),
(111, 'efe_cit', 'efectividad-efectiva'),
(111, 'est_cit', 'status-agendada'),
(112, 'efe_cit', 'efectividad-no-efectiva'),
(112, 'est_cit', 'status-registro'),
(112, 'hora_cit', 'cell-red'),
(113, 'efe_cit', 'efectividad-efectiva'),
(113, 'est_cit', 'status-agendada'),
(114, 'date_cita', 'cell-blue'),
(114, 'efe_cit', 'efectividad-no-efectiva'),
(114, 'est_cit', 'status-registro'),
(115, 'efe_cit', 'efectividad-efectiva'),
(115, 'est_cit', 'status-agendada'),
(115, 'nom_cita', 'cell-green'),
(116, 'efe_cit', 'efectividad-no-efectiva'),
(116, 'est_cit', 'status-registro'),
(117, 'date_cita', 'cell-blue'),
(117, 'efe_cit', 'efectividad-efectiva'),
(117, 'est_cit', 'status-agendada'),
(118, 'efe_cit', 'efectividad-no-efectiva'),
(118, 'est_cit', 'status-registro'),
(119, 'efe_cit', 'efectividad-efectiva'),
(119, 'est_cit', 'status-agendada'),
(119, 'hora_cit', 'cell-red'),
(120, 'date_cita', 'cell-blue'),
(120, 'efe_cit', 'efectividad-no-efectiva'),
(120, 'est_cit', 'status-registro'),
(120, 'nom_cita', 'cell-green'),
(121, 'efe_cit', 'efectividad-efectiva'),
(121, 'est_cit', 'status-agendada'),
(122, 'efe_cit', 'efectividad-no-efectiva'),
(122, 'est_cit', 'status-registro'),
(123, 'date_cita', 'cell-blue'),
(123, 'efe_cit', 'efectividad-efectiva'),
(123, 'est_cit', 'status-agendada'),
(124, 'efe_cit', 'efectividad-no-efectiva'),
(124, 'est_cit', 'status-registro'),
(125, 'efe_cit', 'efectividad-efectiva'),
(125, 'est_cit', 'status-agendada'),
(125, 'nom_cita', 'cell-green'),
(126, 'date_cita', 'cell-blue'),
(126, 'efe_cit', 'efectividad-no-efectiva'),
(126, 'est_cit', 'status-registro'),
(126, 'hora_cit', 'cell-red'),
(127, 'efe_cit', 'efectividad-efectiva'),
(127, 'est_cit', 'status-invasion'),
(128, 'efe_cit', 'efectividad-no-efectiva'),
(128, 'est_cit', 'status-registro'),
(129, 'date_cita', 'cell-blue'),
(129, 'efe_cit', 'efectividad-efectiva'),
(129, 'est_cit', 'status-agendada'),
(130, 'efe_cit', 'efectividad-no-efectiva'),
(130, 'est_cit', 'status-registro'),
(130, 'nom_cita', 'cell-green'),
(131, 'efe_cit', 'efectividad-efectiva'),
(131, 'est_cit', 'status-agendada'),
(132, 'date_cita', 'cell-blue'),
(132, 'efe_cit', 'efectividad-no-efectiva'),
(132, 'est_cit', 'status-registro'),
(133, 'efe_cit', 'efectividad-efectiva'),
(133, 'est_cit', 'status-agendada'),
(133, 'hora_cit', 'cell-red'),
(134, 'efe_cit', 'efectividad-no-efectiva'),
(134, 'est_cit', 'status-registro'),
(135, 'date_cita', 'cell-blue'),
(135, 'efe_cit', 'efectividad-efectiva'),
(135, 'est_cit', 'status-agendada'),
(135, 'nom_cita', 'cell-green'),
(136, 'efe_cit', 'efectividad-no-efectiva'),
(136, 'est_cit', 'status-invasion'),
(137, 'efe_cit', 'efectividad-efectiva'),
(137, 'est_cit', 'status-reagendada'),
(138, 'date_cita', 'cell-blue'),
(138, 'efe_cit', 'efectividad-no-efectiva'),
(138, 'est_cit', 'status-registro'),
(139, 'efe_cit', 'efectividad-efectiva'),
(139, 'est_cit', 'status-agendada'),
(140, 'efe_cit', 'efectividad-no-efectiva'),
(140, 'est_cit', 'status-registro'),
(140, 'hora_cit', 'cell-red'),
(140, 'nom_cita', 'cell-green'),
(141, 'date_cita', 'cell-blue'),
(141, 'efe_cit', 'efectividad-efectiva'),
(141, 'est_cit', 'status-agendada'),
(142, 'efe_cit', 'efectividad-no-efectiva'),
(142, 'est_cit', 'status-registro'),
(143, 'efe_cit', 'efectividad-efectiva'),
(143, 'est_cit', 'status-agendada'),
(144, 'date_cita', 'cell-blue'),
(144, 'efe_cit', 'efectividad-no-efectiva'),
(144, 'est_cit', 'status-registro'),
(145, 'efe_cit', 'efectividad-efectiva'),
(145, 'est_cit', 'status-agendada'),
(145, 'nom_cita', 'cell-green'),
(146, 'efe_cit', 'efectividad-no-efectiva'),
(146, 'est_cit', 'status-registro'),
(147, 'date_cita', 'cell-blue'),
(147, 'efe_cit', 'efectividad-efectiva'),
(147, 'est_cit', 'status-agendada'),
(147, 'hora_cit', 'cell-red'),
(148, 'efe_cit', 'efectividad-no-efectiva'),
(148, 'est_cit', 'status-registro'),
(149, 'efe_cit', 'efectividad-efectiva'),
(149, 'est_cit', 'status-agendada'),
(150, 'date_cita', 'cell-blue'),
(150, 'efe_cit', 'efectividad-no-efectiva'),
(150, 'est_cit', 'status-registro'),
(150, 'nom_cita', 'cell-green'),
(151, 'efe_cit', 'efectividad-efectiva'),
(151, 'est_cit', 'status-agendada'),
(152, 'efe_cit', 'efectividad-no-efectiva'),
(152, 'est_cit', 'status-registro'),
(153, 'date_cita', 'cell-blue'),
(153, 'efe_cit', 'efectividad-efectiva'),
(153, 'est_cit', 'status-agendada'),
(154, 'efe_cit', 'efectividad-no-efectiva'),
(154, 'est_cit', 'status-registro'),
(154, 'hora_cit', 'cell-red'),
(155, 'efe_cit', 'efectividad-efectiva'),
(155, 'est_cit', 'status-agendada'),
(155, 'nom_cita', 'cell-green'),
(156, 'date_cita', 'cell-blue'),
(156, 'efe_cit', 'efectividad-no-efectiva'),
(156, 'est_cit', 'status-registro'),
(157, 'efe_cit', 'efectividad-efectiva'),
(157, 'est_cit', 'status-agendada'),
(158, 'efe_cit', 'efectividad-no-efectiva'),
(158, 'est_cit', 'status-registro'),
(159, 'date_cita', 'cell-blue'),
(159, 'efe_cit', 'efectividad-efectiva'),
(159, 'est_cit', 'status-agendada'),
(160, 'efe_cit', 'efectividad-no-efectiva'),
(160, 'est_cit', 'status-registro'),
(160, 'nom_cita', 'cell-green'),
(161, 'efe_cit', 'efectividad-efectiva'),
(161, 'est_cit', 'status-agendada'),
(161, 'hora_cit', 'cell-red'),
(162, 'date_cita', 'cell-blue'),
(162, 'efe_cit', 'efectividad-no-efectiva'),
(162, 'est_cit', 'status-registro');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `historial_ejecutivo`
--

CREATE TABLE `historial_ejecutivo` (
  `id_his_eje` int(11) NOT NULL,
  `id_eje11` int(11) NOT NULL,
  `fec_his_eje` datetime DEFAULT CURRENT_TIMESTAMP,
  `res_his_eje` varchar(100) DEFAULT NULL,
  `mov_his_eje` varchar(150) DEFAULT NULL,
  `des_his_eje` text
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `plantel`
--

CREATE TABLE `plantel` (
  `id_pla` varchar(50) NOT NULL,
  `nom_pla` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Volcado de datos para la tabla `plantel`
--

INSERT INTO `plantel` (`id_pla`, `nom_pla`) VALUES
('ECA', 'Ecatepec'),
('NAU', 'Naucalpan'),
('TLA', 'Tlalpan');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `planteles_ejecutivo`
--

CREATE TABLE `planteles_ejecutivo` (
  `id_eje` int(11) NOT NULL,
  `id_pla` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `cita`
--
ALTER TABLE `cita`
  ADD PRIMARY KEY (`id_cita`),
  ADD KEY `id_eje2` (`id_eje2`);

--
-- Indices de la tabla `comentario`
--
ALTER TABLE `comentario`
  ADD PRIMARY KEY (`id_cita`,`id_row`);

--
-- Indices de la tabla `ejecutivo`
--
ALTER TABLE `ejecutivo`
  ADD PRIMARY KEY (`id_eje`),
  ADD KEY `id_padre` (`id_padre`),
  ADD KEY `id_pla` (`id_pla`);

--
-- Indices de la tabla `estilos_celda`
--
ALTER TABLE `estilos_celda`
  ADD PRIMARY KEY (`id_cita`,`id_col`);

--
-- Indices de la tabla `historial_ejecutivo`
--
ALTER TABLE `historial_ejecutivo`
  ADD PRIMARY KEY (`id_his_eje`),
  ADD KEY `id_eje11` (`id_eje11`);

--
-- Indices de la tabla `plantel`
--
ALTER TABLE `plantel`
  ADD PRIMARY KEY (`id_pla`);

--
-- Indices de la tabla `planteles_ejecutivo`
--
ALTER TABLE `planteles_ejecutivo`
  ADD PRIMARY KEY (`id_eje`,`id_pla`),
  ADD KEY `id_pla` (`id_pla`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `cita`
--
ALTER TABLE `cita`
  MODIFY `id_cita` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=163;

--
-- AUTO_INCREMENT de la tabla `ejecutivo`
--
ALTER TABLE `ejecutivo`
  MODIFY `id_eje` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=121;

--
-- AUTO_INCREMENT de la tabla `historial_ejecutivo`
--
ALTER TABLE `historial_ejecutivo`
  MODIFY `id_his_eje` int(11) NOT NULL AUTO_INCREMENT;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `cita`
--
ALTER TABLE `cita`
  ADD CONSTRAINT `cita_ibfk_1` FOREIGN KEY (`id_eje2`) REFERENCES `ejecutivo` (`id_eje`) ON DELETE SET NULL;

--
-- Filtros para la tabla `comentario`
--
ALTER TABLE `comentario`
  ADD CONSTRAINT `comentario_ibfk_1` FOREIGN KEY (`id_cita`) REFERENCES `cita` (`id_cita`) ON DELETE CASCADE;

--
-- Filtros para la tabla `ejecutivo`
--
ALTER TABLE `ejecutivo`
  ADD CONSTRAINT `ejecutivo_ibfk_1` FOREIGN KEY (`id_padre`) REFERENCES `ejecutivo` (`id_eje`) ON DELETE SET NULL,
  ADD CONSTRAINT `ejecutivo_ibfk_2` FOREIGN KEY (`id_pla`) REFERENCES `plantel` (`id_pla`) ON DELETE SET NULL;

--
-- Filtros para la tabla `estilos_celda`
--
ALTER TABLE `estilos_celda`
  ADD CONSTRAINT `estilos_celda_ibfk_1` FOREIGN KEY (`id_cita`) REFERENCES `cita` (`id_cita`) ON DELETE CASCADE;

--
-- Filtros para la tabla `historial_ejecutivo`
--
ALTER TABLE `historial_ejecutivo`
  ADD CONSTRAINT `historial_ejecutivo_ibfk_1` FOREIGN KEY (`id_eje11`) REFERENCES `ejecutivo` (`id_eje`) ON DELETE CASCADE;

--
-- Filtros para la tabla `planteles_ejecutivo`
--
ALTER TABLE `planteles_ejecutivo`
  ADD CONSTRAINT `planteles_ejecutivo_ibfk_1` FOREIGN KEY (`id_eje`) REFERENCES `ejecutivo` (`id_eje`) ON DELETE CASCADE,
  ADD CONSTRAINT `planteles_ejecutivo_ibfk_2` FOREIGN KEY (`id_pla`) REFERENCES `plantel` (`id_pla`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
